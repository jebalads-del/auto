import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import sql from '../db';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم
    const userCheck = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `;

    if (userCheck.length === 0) {
      return NextResponse.json(
        { message: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني' },
        { status: 404 }
      );
    }

    // توليد OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30); // 30 دقيقة

    // حفظ OTP في قاعدة البيانات (نفس جدول users)
    await sql`
      UPDATE users 
      SET reset_otp = ${otpCode}, reset_otp_expires_at = ${otpExpiry}
      WHERE email = ${email}
    `;

    // إرسال OTP عبر البريد
    await resend.emails.send({
      from: 'noreply@sayarty.store',
      to: [email],
      subject: '🔑 إعادة تعيين كلمة المرور - كود التحقق',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
          <h1 style="color: #2563eb; text-align: center;">🔑 إعادة تعيين كلمة المرور</h1>
          <p style="text-align: center; font-size: 16px; color: #333;">
            لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.
          </p>
          <p style="text-align: center; font-size: 16px; color: #333;">
            استخدم الكود التالي لإعادة تعيين كلمة المرور:
          </p>
          <div style="background: white; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 12px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="text-align: center; color: #64748b; font-size: 14px;">
            ⏳ هذا الكود صالح لمدة 30 دقيقة فقط.
          </p>
          <p style="text-align: center; color: #94a3b8; font-size: 12px;">
            إذا لم تقم بطلب إعادة التعيين، يرجى تجاهل هذا البريد.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال كود إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    });

  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين كلمة السر:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء إرسال كود إعادة التعيين' },
      { status: 500 }
    );
  }
}
