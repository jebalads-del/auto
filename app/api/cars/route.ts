import { NextRequest, NextResponse } from 'next/server';
import sql from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب كافة إعلانات السيارات الحية للإدارة والموقع...');
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
    const body = await request.json();
    console.log('📩 استقبال بيانات الإعلان وتطهيرها:', body);
    
    const brandName = String(body.brand || body.make || body.الماركة || '').trim();
    const modelName = String(body.model || body.الموديل || '').trim();
    const title = String(body.title || `${brandName} ${modelName}`).trim() || 'إعلان سيارة جديد';
    
    // التحويل القسري والمضمون للسعر ليصبح رقماً صحيحاً وتجنب انهيار قاعدة البيانات
    const rawPrice = body.price || body.السعر || 0;
    const price = isNaN(Number(rawPrice)) ? 0 : Math.floor(Number(rawPrice));
    
    const year = body.year || body.سنة_الصنع || '';
    const mileage = body.kilometers || body.mileage || body.الممشى || '';
    const color = body.color || body.اللون || '';
    const baseDesc = body.description || body.desc || body.وصف_الإعلان || 'ممتاز';
    
    const description = `${baseDesc} | سنة الصنع: ${year} | الممشى: ${mileage} | اللون: ${color}`.trim();
    const image_url = String(body.image_url || body.img || '');
    const status = 'pending';

    const query = `
      INSERT INTO cars (title, price, description, image_url, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `;
    
    await sql.query(query, [title, price, description, image_url, status]);
    return NextResponse.json({ success: true, message: '🎉 تم إرسال الإعلان بنجاح وينتظر موافقة الإدارة' });
    
  } catch (error: any) {
    console.error('❌ خطأ قاتل في السيرفر أثناء الحفظ بجدول cars:', error);
    // إرجاع رد JSON سليم ومغلق تماماً لمنع حدوث خطأ الـ JSON الموقعي الخاطف
    return NextResponse.json({ success: false, message: 'فشل في حفظ البيانات: ' + error.message }, { status: 200 });
  }
}
