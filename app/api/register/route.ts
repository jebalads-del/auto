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
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30);

    // إدراج المستخدم
    const result = await sql`
      INSERT INTO users (name, email, password, otp_code, otp_expires_at, status) 
      VALUES (${name}, ${email}, ${password}, ${otpCode}, ${otpExpiry}, 'pending')
      RETURNING id, email, name
    `;

    console.log('✅ تم إنشاء المستخدم:', email);

    // ✅ إرسال OTP عبر Resend مع النطاق الخاص
    try {
      const { data, error } = await resend.emails.send({
        from: 'noreply@sayarty.store', // ✅ تم التغيير إلى النطاق الخاص
        to: [email],
        subject: '🔐 رمز التحقق - Sayarty',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
            <h1 style="color: #2563eb; text-align: center; margin-bottom: 20px;">🚗 Sayarty</h1>
            <h2 style="text-align: center; color: #1e293b;">مرحباً بك! 🎉</h2>
            <p style="text-align: center; font-size: 16px; color: #333;">رمز التحقق الخاص بك هو:</p>
            <div style="background: white; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 12px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 20px 0;">
              ${otpCode}
            </div>
            <p style="text-align: center; color: #64748b; font-size: 14px;">
              ⏳ هذا الرمز صالح لمدة 10 دقائق فقط.
            </p>
            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
              إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ خطأ Resend:', error);
        return NextResponse.json({
          success: true,
          userId: result[0].id,
          email: result[0].email,
          warning: 'تم التسجيل لكن فشل إرسال البريد: ' + error.message,
        });
      }

      console.log('✅ تم إرسال OTP إلى:', email, 'ID:', data?.id);

      return NextResponse.json({
        success: true,
        userId: result[0].id,
        email: result[0].email,
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      });

    } catch (emailError) {
      console.error('❌ فشل إرسال البريد:', emailError);
      return NextResponse.json({
        success: true,
        userId: result[0].id,
        email: result[0].email,
        warning: 'تم التسجيل لكن فشل إرسال البريد. حاول مرة أخرى.',
      });
    }

  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
}
