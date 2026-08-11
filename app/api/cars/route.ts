import { NextRequest, NextResponse } from 'next/server';
import sql from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب كافة إعلانات السيارات الحية بالإدارة والموقع...');
    const query = `
      SELECT id, brand, model, price, year, kilometers, color, status, created_at 
      FROM cars 
      WHERE status IS NULL OR status IN ('pending', 'approved', 'active', 'sold', 'rejected')
      ORDER BY id DESC
    `;
    const result = await sql.query(query);
    const formattedCars = (result.rows || []).map((car: any) => ({
      id: car.id,
      title: `${car.brand || ''} ${car.model || ''}`.trim() || 'سيارة جديدة',
      price: car.price || 0,
      description: `سنة الصنع: ${car.year || ''} | الممشى: ${car.kilometers || ''} كم | اللون: ${car.color || 'غير محدد'}`,
      status: car.status || 'pending',
      created_at: car.created_at
    }));
    return NextResponse.json({ success: true, cars: formattedCars });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawText = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawText);
    } catch {
      const params = new URLSearchParams(rawText);
      body = Object.fromEntries(params.entries());
    }

    console.log('📩 السيرفر استلم طلب نشر من الواجهة الأصلية:', body);

    // تفكيك البيانات بدعم كامل لكافة صياغات الأحرف الكبيرة والصغيرة (Case-Insensitive)
    const brand = String(body.brand || body.make || body.Brand || body.الماركة || 'تويوتا').trim();
    const model = String(body.model || body.carModel || body.Model || body.الموديل || 'كامري').trim();
    
    const rawPrice = String(body.price || body.Price || body.السعر || '0').replace(/[^0-9]/g, '');
    const price = parseInt(rawPrice, 10) || 0;
    
    const rawYear = String(body.year || body.carYear || body.Year || body.سنة_الصنع || '2021').replace(/[^0-9]/g, '');
    const year = parseInt(rawYear, 10) || 2021;
    
    const rawKilometers = String(body.kilometers || body.mileage || body.Kilometers || body.الممشى || '0').replace(/[^0-9]/g, '');
    const kilometers = parseInt(rawKilometers, 10) || 0;
    
    const status = 'pending';
    const userId = parseInt(body.user_id || body.userId || body.user || '1', 10) || 1;

    // 🌟 تحصين صارم وشامل لحقل اللون ضد قيود الـ Not-Null في Neon
    let color = 'رمادي'; // قيمة افتراضية في حال فشل القراءة بالكامل
    
    // فحص كافة المفاتيح الممكنة في كائن البيانات المستلم للوصول لقيمة اللون المكتوبة
    const colorKey = Object.keys(body).find(key => key.toLowerCase().includes('color') || key.includes('اللون'));
    if (colorKey && body[colorKey]) {
      color = String(body[colorKey]).trim();
    } else if (body.color || body.car_color || body.اللون) {
      color = String(body.color || body.car_color || body.اللون).trim();
    }

    // تأكيد إضافي لمنع وصول قيمة null أو undefined لقاعدة البيانات
    if (!color || color === 'undefined' || color === 'null' || color === '') {
      color = 'رمادي';
    }

    console.log('💾 حفظ قسري آمن ومتوافق مع شروط حقول قاعدة البيانات:', { brand, model, price, color });

    const query = `
      INSERT INTO cars (user_id, brand, model, price, year, kilometers, color, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `;
    
    await sql.query(query, [userId, brand, model, price, year, kilometers, color, status]);
    return NextResponse.json({ success: true, message: '🎉 تم إرسال وحفظ الإعلان بنجاح في قاعدة البيانات!' });
    
  } catch (error: any) {
    console.error('❌ خطأ في السيرفر أثناء الحفظ بجدول cars:', error);
    return NextResponse.json({ success: false, message: 'فشل في الحفظ: ' + error.message }, { status: 200 });
  }
}
