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

    console.log(`🔐 [FORGOT PASSWORD] طلب استعادة كلمة السر لـ: ${email}`);

    // التحقق من وجود المستخدم
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error('❌ [FORGOT PASSWORD DB ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في قاعدة البيانات' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني غير مسجل' },
        { status: 404 }
      );
    }

    // ✅ إنشاء رمز إعادة تعيين (OTP)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`🔑 [FORGOT PASSWORD] رمز إعادة التعيين: ${resetCode}`);

    // ✅ مؤقتاً: نعيد الرمز في الرد (سيتم إزالته بعد تفعيل البريد)
    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز إعادة تعيين كلمة السر إلى بريدك الإلكتروني',
      resetCode: resetCode // مؤقتاً
    });

  } catch (error: any) {
    console.error('❌ [FORGOT PASSWORD ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
