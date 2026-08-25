<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    console.log(`📧 [RESEND OTP] إعادة إرسال رمز التحقق إلى: ${email}`);

    // توليد رمز عشوائي جديد
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // مدة صلاحية الرمز (15 دقيقة)
    const expiresIn = 15 * 60; // 15 دقيقة
    
    // ✅ هنا يمكنك حفظ الرمز في قاعدة البيانات إذا أردت
    // ولكننا سنتجاوز هذه الخطوة حالياً
    
    console.log(`🔑 [RESEND OTP] الرمز الجديد: ${otp}`);
    console.log(`⏰ [RESEND OTP] صالح لمدة: ${expiresIn} ثانية`);

    // ✅ نجاح وهمي (للتجربة)
    return NextResponse.json({
      success: true,
      message: 'تم إعادة إرسال الرمز بنجاح',
      expiresIn: expiresIn
    });

  } catch (error: any) {
    console.error('❌ [RESEND OTP ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
=======
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
>>>>>>> 2b1e27f18d7beee545ea3bba83a1065c5a49da78
  }
}
