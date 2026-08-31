import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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

    // إنشاء عميل Supabase باستخدام @supabase/ssr
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // التحقق من وجود المستخدم (محاولة تسجيل الدخول للتحقق)
    // ملاحظة: هذه طريقة بديلة لأن admin.getUserByEmail قد لا يكون متاحاً
    const { data: user, error: userError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: 'temporary_password_123', // كلمة مؤقتة للتحقق فقط
    });

    // إذا كان الخطأ بسبب كلمة المرور (مستخدم موجود)، نعتبره نجاح
    // إذا كان الخطأ بسبب عدم وجود المستخدم، نرفض
    if (userError && userError.message.includes('Invalid login credentials')) {
      // المستخدم موجود ولكن كلمة المرور خاطئة (هذا طبيعي)
      console.log(`✅ [FORGOT PASSWORD] المستخدم موجود: ${email}`);
    } else if (userError) {
      console.error('❌ [FORGOT PASSWORD] خطأ:', userError);
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني غير مسجل أو حدث خطأ' },
        { status: 404 }
      );
    }

    // إرسال رابط إعادة تعيين كلمة المرور عبر Supabase
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/reset-password`,
      }
    );

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
