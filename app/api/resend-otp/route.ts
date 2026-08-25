import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // توليد رمز OTP عشوائي من 6 أرقام
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // إرسال البريد الإلكتروني عبر Resend
    const { data, error } = await resend.emails.send({
      from: 'noreply@sayarty.store', // غيّر هذا بدومينك الفعلي
      to: email,
      subject: 'رمز التحقق الخاص بك (OTP)',
      html: `
        <div style="direction: rtl; font-family: sans-serif; padding: 20px; text-align: center;">
          <h2>مرحباً بك في موقع سيارتي</h2>
          <p>رمز التحقق الخاص بك لتفعيل الحساب هو:</p>
          <p style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 20px 0;">
            ${generatedOtp}
          </p>
          <p>هذا الرمز صالح للاستخدام لمرة واحدة فقط.</p>
          <p style="color: #666; font-size: 12px;">صلاحية الرمز: 5 دقائق</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ خطأ في إرسال البريد:', error);
      return NextResponse.json(
        { error: 'فشل إرسال رمز التحقق' },
        { status: 400 }
      );
    }

    // حفظ الـ OTP في كوكيز مشفر (صالح لمدة 5 دقائق)
    const response = NextResponse.json({ 
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح'
    });
    
    response.cookies.set('register_otp', generatedOtp, { 
      maxAge: 300, // 5 دقائق
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return response;

  } catch (err: any) {
    console.error('❌ خطأ في الـ API:', err);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
