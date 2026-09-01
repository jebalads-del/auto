import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    console.log(`🔐 [FORGOT PASSWORD] طلب استعادة كلمة السر لـ: ${email}`);

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

    // طلب إرسال OTP بدلاً من الرابط
    // استخدم signInWithOtp بدلاً من resetPasswordForEmail
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // لا تنشئ مستخدم جديد
        // هذا يرسل OTP بدلاً من الرابط
      },
    });

    if (error) {
      console.error('❌ Error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.message.includes('User not found') ? 404 : 500 }
      );
    }

    console.log(`✅ [FORGOT PASSWORD] تم إرسال OTP لـ: ${email}`);

    return NextResponse.json({
      success: true,
      message: '✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      email: email,
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ' },
      { status: 500 }
    );
  }
}
