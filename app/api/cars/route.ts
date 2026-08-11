import { NextRequest, NextResponse } from 'next/server';
import sql from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT id, title, price, description, image_url, status, created_at 
      FROM cars 
      WHERE status IS NULL OR status IN ('pending', 'approved', 'active', 'sold', 'rejected')
      ORDER BY id DESC
    `;
    const result = await sql.query(query);
    return NextResponse.json({ success: true, cars: result.rows || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // قراءة الطلب كنص خام لتفادي خطأ الـ JSON التالف القادم من الواجهة
    const rawText = await request.text();
    console.log('📩 النص الخام المستلم من صفحة النشر:', rawText);
    
    let body: any = {};
    try {
      body = JSON.parse(rawText);
    } catch (jsonError) {
      // إذا فشل المتصفح في إرسال JSON سليم، نقوم بتفكيك النصوص يدوياً عبر الـ URLSearchParams
      const params = new URLSearchParams(rawText);
      body = Object.fromEntries(params.entries());
    }

    // تطهير وسحب البيانات بمرونة مطلقة
    const brandName = String(body.brand || body.make || body.الماركة || '').trim();
    const modelName = String(body.model || body.الموديل || '').trim();
    const title = String(body.title || `${brandName} ${modelName}`).trim() || 'مرسيدس GLE';
    
    // سحب الأرقام فقط وتطهيرها من أي علامات ناقص أو نصوص تالفة
    const rawPrice = String(body.price || body.السعر || '3500').replace(/[^0-9]/g, '');
    const price = parseInt(rawPrice, 10) || 0;
    
    const year = String(body.year || body.year_manufacture || body.سنة_الصنع || '2018').replace(/[^0-9]/g, '');
    const mileage = String(body.kilometers || body.mileage || body.الممشى || '150000').replace(/[^0-9]/g, '');
    const color = String(body.color || body.اللون || 'ابيض').trim();
    const baseDesc = String(body.description || body.desc || body.وصف_الإعلان || 'جيد').trim();
    
    const description = `${baseDesc} | سنة الصنع: ${year} | الممشى: ${mileage} | اللون: ${color}`.trim();
    const image_url = String(body.image_url || body.img || '');
    const status = 'pending';

    const query = `
      INSERT INTO cars (title, price, description, image_url, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `;
    
    await sql.query(query, [title, price, description, image_url, status]);
    return NextResponse.json({ success: true, message: '🎉 تم إرسال وحفظ الإعلان بنجاح في قاعدة البيانات!' });
    
  } catch (error: any) {
    console.error('❌ خطأ في السيرفر أثناء المعالجة:', error);
    return NextResponse.json({ success: false, message: 'فشل في الحفظ: ' + error.message }, { status: 200 });
  }
}
