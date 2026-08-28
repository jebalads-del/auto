import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    console.log(`🔐 [LOGIN] محاولة تسجيل دخول: ${email}`);

    // إنشاء عميل Supabase عادي
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // محاولة تسجيل الدخول باستخدام Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    if (error) {
      console.error('❌ [LOGIN AUTH ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    console.log(`✅ [LOGIN] تم تسجيل الدخول: ${email}`);

    // ✅ تحديد role بناءً على البريد الإلكتروني
    let userRole = 'user';
    if (email === 'admin@sayarty.store') {
      userRole = 'admin';
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userRole,
        status: 'active'
      }
    });

  } catch (error: any) {
    console.error('❌ [LOGIN ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
