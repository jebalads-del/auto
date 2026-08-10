import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_wf0AZITP7Chv@ep-icy-frost-atd2gbfq-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. إذا كان الطلب قادم من صفحة الـ checkout لتسجيل طلب تمييز سيارة
    if (body.type === 'featured' || body.carId) {
      const { carId, paymentMethod, amount } = body;
      
      // التأكد من وجود جدول الطلبات أو إنشائه تلقائياً إن لم يكن موجوداً
      await sql`
        CREATE TABLE IF NOT EXISTS featured_requests (
          id SERIAL PRIMARY KEY,
          car_id INT NOT NULL,
          payment_method VARCHAR(50),
          amount NUMERIC,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // إدخال طلب التمييز الجديد بقاعدة البيانات بالحالة المبدئية "pending" (قيد الانتظار)
      await sql`
        INSERT INTO featured_requests (car_id, payment_method, amount, status)
        VALUES (${Number(carId)}, ${paymentMethod}, ${Number(amount || 10)})
      `;
      
      return NextResponse.json({ success: true, message: 'تم إرسال طلب التمييز للأدمن بنجاح' });
    }

    // 2. إذا كان الطلب قادم من صفحة إعدادات الأدمن لحفظ قنوات الاستلام
    const { paypalEmail, westernName, westernCountry } = body;
    await sql`DELETE FROM site_payment_settings`;
    await sql`
      INSERT INTO site_payment_settings (paypal_email, western_name, western_country)
      VALUES (${paypalEmail}, ${westernName}, ${westernCountry})
    `;
    return NextResponse.json({ success: true, message: 'تم حفظ بيانات المستلم بنجاح' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في السيرفر: ' + error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await sql`SELECT * FROM site_payment_settings LIMIT 1`;
    return NextResponse.json(data[0] || { paypal_email: '', western_name: '', western_country: '' });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
  }
}
