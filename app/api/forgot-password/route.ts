import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // إنشاء عميل Supabase
    const supabase = createRouteHandlerClient({ cookies });

    // التحقق من وجود المستخدم في auth.users
    const { data: user, error } = await supabase.auth.admin.getUserByEmail(email.toLowerCase().trim());

    if (error) {
      console.error('❌ [FORGOT PASSWORD DB ERROR]:', error);
      
      // إذا كان الخطأ بسبب عدم وجود المستخدم
      if (error.message.includes('User not found')) {
        return NextResponse.json(
          { success: false, message: 'البريد الإلكتروني غير مسجل' },
          { status: 404 }
        );
      }
      
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

    // ✅ إرسال رابط إعادة تعيين كلمة المرور عبر Supabase
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/reset-password`,
    });

    if (resetError) {
      console.error('❌ [RESET PASSWORD ERROR]:', resetError);
      return NextResponse.json(
        { success: false, message: resetError.message || 'حدث خطأ في إرسال رابط إعادة التعيين' },
        { status: 500 }
      );
    }

    console.log(`✅ [FORGOT PASSWORD] تم إرسال رابط إعادة التعيين لـ: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة السر إلى بريدك الإلكتروني',
    });

  } catch (error: any) {
    console.error('❌ [FORGOT PASSWORD ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
