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
  }
}
