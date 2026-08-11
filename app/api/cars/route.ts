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
    
    // دعم ودمج كافة المسميات العربية والإنجليزية المحتملة القادمة من حقول صفحة النشر
    const brandName = body.brand || body.make || body.الماركة || '';
    const modelName = body.model || body.الموديل || '';
    const title = body.title || `${brandName} ${modelName}`.trim() || 'إعلان سيارة جديد';
    
    const price = body.price || body.السعر || 0;
    
    // دمج بقية البيانات التفصيلية كاللون والممشى وسنة الصنع في الوصف لمنع ضياعها
    const year = body.year || body.سنة_الصنع || '';
    const mileage = body.mileage || body.الممشى || '';
    const color = body.color || body.اللون || '';
    const baseDesc = body.description || body.desc || body.وصف_الإعلان || 'ممتاز';
    
    const description = `${baseDesc} | سنة الصنع: ${year} | الممشى: ${mileage} | اللون: ${color}`.trim();
    const image_url = body.image_url || body.img || body.images?.[0] || '';
    const status = 'pending';

    console.log('📩 جاري حفظ سيارة تفصيلية في جدول cars:', { title, price });

    const query = `
      INSERT INTO cars (title, price, description, image_url, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `;
    
    await sql.query(query, [title, price, description, image_url, status]);
    return NextResponse.json({ success: true, message: '🎉 تم إرسال الإعلان بنجاح وينتظر موافقة الإدارة' });
    
  } catch (error: any) {
    console.error('❌ خطأ في السيرفر أثناء الحفظ بجدول cars:', error);
    // إرسال استجابة سليمة بصيغة JSON لمنع تشنج المتصفح وظهور الخطأ الأحمر القديم
    return NextResponse.json({ success: false, message: error.message }, { status: 200 });
  }
}
