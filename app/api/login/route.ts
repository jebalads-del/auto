import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// استخدام Service Role Key للوصول إلى Admin API
// استخدام ANON_KEY بدلاً من SERVICE_ROLE_KEY
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // البحث عن المستخدم في auth.users
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ [LOGIN ERROR]:', listError);
      return NextResponse.json(
        { success: false, message: 'خطأ في قاعدة البيانات' },
        { status: 500 }
      );
    }

    // البحث عن المستخدم بالبريد الإلكتروني
    const user = users.users.find((u: any) => u.email === email.toLowerCase().trim());

    if (!user) {
      console.log('❌ [LOGIN] المستخدم غير موجود');
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // محاولة تسجيل الدخول باستخدام Supabase Auth
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
