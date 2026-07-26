import { NextRequest, NextResponse } from 'next/server';
import sql from '../db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, position, image, link_url } = body;

    console.log('📦 البيانات المستلمة:', { user_id, position, link_url });

    if (!user_id || !position || !image) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // جلب إعدادات السعر
    const settings = await sql`
      SELECT value FROM site_settings WHERE key = 'commercial_ad'
    `;

    let price = 100;
    let durationDays = 30;

    if (settings.length > 0) {
      const config = settings[0].value;
      price = position === 'header' ? (config.header_price || 100) : (config.footer_price || 75);
      durationDays = config.duration_days || 30;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

   // ✅ إضافة حقل payment_status
INSERT INTO commercial_ads (
  user_id, position, status, price, duration_days,
  start_date, end_date, image_url, link_url, payment_status
) VALUES (
  ${user_id}, ${position}, 'pending_payment', ${price}, ${durationDays},
  ${startDate}, ${endDate}, ${image}, ${link_url || null}, 'unpaid'
)
    const result = await sql`
      INSERT INTO commercial_ads (
        user_id, position, status, price, duration_days,
        start_date, end_date, image_url, link_url
      ) VALUES (
        ${user_id}, ${position}, 'pending', ${price}, ${durationDays},
        ${startDate}, ${endDate}, ${image}, ${link_url || null}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلب الإعلان بنجاح',
      ad: result[0],
    });
  } catch (error) {
    console.error('❌ خطأ في إرسال طلب الإعلان:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إرسال الطلب' },
      { status: 500 }
    );
  }
}
