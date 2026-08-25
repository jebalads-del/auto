import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// تهيئة مكتبة Resend عبر الـ API KEY المخزن في بيئة العمل بـ Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    // توليد رمز OTP رقمي عشوائي مكون من 6 أرقام يدوياً
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // إرسال الـ OTP عبر دالة ريسيند الرسمية والمباشرة بالـ API
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // أو الدومين الموثق الخاص بك مثل info@sayarty.store
      to: email,
      subject: 'رمز التحقق الخاص بك (OTP)',
      html: `
        <div style="direction: rtl; font-family: sans-serif; padding: 20px; text-align: center;">
          <h2>مرحباً بك في موقع سيارتي</h2>
          <p>رمز التحقق الخاص بك لتفعيل الحساب هو:</p>
          <p style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; margin: 20px 0;">
            ${generatedOtp}
          </p>
          <p>هذا الرمز صالحة للاستخدام لمرة واحدة فقط.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // إرجاع نجاح العملية مع الـ OTP المتولد ليتم التحقق منه في صفحة الـ Verify لاحقاً عبر الكوكيز أو الحالة
    // ملاحظة أمنية: في الإنتاج الفعلي، يفضل حفظ الـ OTP مؤقتاً في كوكيز مشفر أو جدول بقاعدة البيانات
    const response = NextResponse.json({ success: true });
    response.cookies.set('register_otp', generatedOtp, { maxAge: 300, httpOnly: true }); // صالح لمدة 5 دقائق
    return response;

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
