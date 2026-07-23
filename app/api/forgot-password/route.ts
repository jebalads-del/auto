import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import sql from '../db';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // توليد رابط إعادة تعيين كلمة السر (مؤقت)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1);

    // حفظ الرابط في قاعدة البيانات (يمكنك إضافة جدول password_resets)
    await sql`
      INSERT INTO password_resets (email, token, expires_at)
      VALUES (${email}, ${resetToken}, ${resetExpiry})
    `;

    // إرسال البريد
    const resetLink = `${process.env.NEXTAUTH_URL || 'https://sayarty.store'}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: 'noreply@sayarty.store',
      to: [email],
      subject: '🔑 إعادة تعيين كلمة المرور',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
          <h1 style="color: #2563eb; text-align: center;">🔑 إعادة تعيين كلمة المرور</h1>
          <p style="text-align: center; font-size: 16px; color: #333;">
            لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              إعادة تعيين كلمة المرور
            </a>
          </div>
          <p style="text-align: center; color: #64748b; font-size: 14px;">
            هذا الرابط صالح لمدة ساعة واحدة فقط.
          </p>
          <p style="text-align: center; color: #94a3b8; font-size: 12px;">
            إذا لم تقم بطلب إعادة التعيين، يرجى تجاهل هذا البريد.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    });

  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين كلمة السر:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء إرسال رابط إعادة التعيين' },
      { status: 500 }
    );
  }
}
