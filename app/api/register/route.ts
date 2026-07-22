import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import sql from '../db';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم
    const existing = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل بالفعل' },
        { status: 409 }
      );
    }

    // توليد OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    // إدراج المستخدم
    const result = await sql`
      INSERT INTO users (name, email, password, otp_code, otp_expires_at, status) 
      VALUES (${name}, ${email}, ${password}, ${otpCode}, ${otpExpiry}, 'pending')
      RETURNING id, email, name
    `;

    // إرسال OTP عبر Resend
    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: 'رمز التحقق لتسجيل حساب في Sayarty',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h1 style="color: #4F46E5;">مرحباً بك في Sayarty! 🎉</h1>
            <p>رمز التحقق الخاص بك هو:</p>
            <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; border-radius: 10px;">
              ${otpCode}
            </div>
            <p>هذا الرمز صالح لمدة 10 دقائق.</p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        userId: result[0].id,
        email: result[0].email,
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      });

    } catch (emailError) {
      console.error('فشل إرسال البريد:', emailError);
      return NextResponse.json({
        success: true,
        userId: result[0].id,
        email: result[0].email,
        warning: 'تم التسجيل لكن فشل إرسال البريد',
      });
    }

  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
}
