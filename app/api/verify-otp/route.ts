import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني والرمز مطلوبان' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'الرمز يجب أن يكون 6 أرقام' },
        { status: 400 }
      );
    }

    // إنشاء عميل Supabase
    const supabase = createRouteHandlerClient({ cookies });

    // التحقق من الرمز
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      console.error('❌ خطأ في التحقق:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'الرمز غير صحيح' },
        { status: 400 }
      );
    }

    if (data?.user) {
      // التحقق من وجود المستخدم في جدول users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // إذا لم يكن موجوداً، أضفه
      if (!existingUser && !checkError) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'مستخدم',
              role: 'user',
              status: 'active',
            }
          ]);

        if (insertError) {
          console.error('❌ خطأ في إضافة المستخدم:', insertError);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'تم التحقق بنجاح',
      user: data?.user 
    });

  } catch (error: any) {
    console.error('❌ خطأ في API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
