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
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم
    const userCheck = await sql`
      SELECT id, email, status FROM users WHERE email = ${email}
    `;

    if (userCheck.length === 0) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    const user = userCheck[0];

    // التأكد من أن الحساب غير مفعّل
    if (user.status === 'active') {
      return NextResponse.json(
        { error: 'الحساب مفعّل بالفعل' },
        { status: 400 }
      );
    }

    // توليد OTP جديد
    const otpCode = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    // تحديث OTP في قاعدة البيانات
    await sql`
      UPDATE users 
      SET otp_code = ${otpCode}, otp_expires_at = ${otpExpiry}
      WHERE email = ${email}
    `;

    // إرسال OTP عبر Resend
    try {
      const { error } = await resend.emails.send({
        from: 'noreply@sayarty.store',
        to: [email],
        subject: '🔐 إعادة إرسال رمز التحقق - Sayarty',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
            <h1 style="color: #2563eb; text-align: center; margin-bottom: 20px;">🚗 Sayarty</h1>
            <h2 style="text-align: center; color: #1e293b;">رمز تحقق جديد</h2>
            <p style="text-align: center; font-size: 16px; color: #333;">رمز التحقق الجديد الخاص بك هو:</p>
            <div style="background: white; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 12px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0;">
              ${otpCode}
            </div>
            <p style="text-align: center; color: #64748b; font-size: 14px;">
              ⏳ هذا الرمز صالح لمدة 10 دقائق فقط.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ خطأ Resend:', error);
        return NextResponse.json(
          { error: 'فشل إرسال البريد: ' + error.message },
          { status: 500 }
        );
      }

      console.log('✅ تم إعادة إرسال OTP إلى:', email);

      return NextResponse.json({
        success: true,
        message: 'تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني',
      });

    } catch (emailError) {
      console.error('❌ فشل إرسال البريد:', emailError);
      return NextResponse.json(
        { error: 'فشل إرسال البريد' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ خطأ في إعادة إرسال OTP:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعادة إرسال الرمز' },
      { status: 500 }
    );
  }
}
