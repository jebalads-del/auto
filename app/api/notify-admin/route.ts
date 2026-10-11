import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { car, ownerName, ownerEmail } = await request.json();

    if (!car) {
      return NextResponse.json(
        { success: false, message: 'بيانات الإعلان مطلوبة' },
        { status: 400 }
      );
    }

    console.log('📧 إرسال إشعار إعلان جديد للأدمن');

    // 1. إرسال الإيميل للأدمن
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Sayarty <noreply@sayarty.store>',
      to: ['admin@sayarty.store'],
      subject: `🚗 إعلان جديد بانتظار المراجعة: ${car.brand} ${car.model}`,
      html: `
        <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb;">
            <h1 style="color: #2563eb; margin: 0;">🚗 سيارتي ستور</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">إشعار إعلان جديد</p>
          </div>

          <div style="padding: 20px 0;">
            <h2 style="color: #1e293b; margin-bottom: 15px;">📢 إعلان جديد بانتظار المراجعة</h2>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-right: 4px solid #f59e0b; margin-bottom: 15px;">
              <p style="margin: 5px 0;"><strong>🚗 السيارة:</strong> ${car.brand} ${car.model}</p>
              <p style="margin: 5px 0;"><strong>💰 السعر:</strong> ${car.price} ${car.currency || 'د.ك'}</p>
              ${car.year ? `<p style="margin: 5px 0;"><strong>📅 السنة:</strong> ${car.year}</p>` : ''}
              ${car.kilometers ? `<p style="margin: 5px 0;"><strong>📊 الممشي:</strong> ${car.kilometers.toLocaleString()} كم</p>` : ''}
              ${car.color ? `<p style="margin: 5px 0;"><strong>🎨 اللون:</strong> ${car.color}</p>` : ''}
            </div>

            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-right: 4px solid #3b82f6; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">👤 صاحب الإعلان</h3>
              <p style="margin: 5px 0;"><strong>الاسم:</strong> ${ownerName || 'غير معروف'}</p>
              <p style="margin: 5px 0;"><strong>البريد:</strong> ${ownerEmail || 'غير معروف'}</p>
            </div>

            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sayarty.store'}/dashboard/admin" 
                 style="background: #2563eb; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                🔍 مراجعة الإعلان الآن
              </a>
            </div>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
            <p>© 2026 سيارتي ستور — جميع الحقوق محفوظة</p>
          </div>

        </div>
      `,
    });

    if (error) {
      console.error('❌ فشل إرسال الإيميل:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    console.log('✅ تم إرسال الإشعار:', data);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('❌ خطأ:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ' },
      { status: 500 }
    );
  }
}
