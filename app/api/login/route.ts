import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'الرجاء ملء جميع الحقول المطلوبة' }, { status: 400 });
    }

    console.log(`🔐 [LOGIN PROCESS] محاولة تسجيل دخول للبريد: ${email}`);

    // 1. التحقق الأمني المشفر والمباشر من البريد وكلمة السر داخل Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password
    });

    if (authError || !authData.user) {
      console.error('❌ [AUTH ERROR]:', authError?.message);
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة!' },
        { status: 401 }
      );
    }

    // 2. جلب رتبة المستخدم الحقيقية والاسم من الجدول العام للتحقق من الصلاحيات
    let userRole = 'user';
    let userName = 'مستخدم جديد';

    const { data: dbUser } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', authData.user.id)
      .single();

    if (dbUser) {
      userRole = dbUser.role || 'user';
      userName = dbUser.name || userName;
    }

    // تأمين إضافي للأدمن المعتمد للموقع
    if (email.toLowerCase().trim() === 'admin@sayarty.store') {
      userRole = 'admin';
      userName = 'المدير العام';
    }

    console.log(`✅ [LOGIN SUCCESS] تم تسجيل دخول ${userName} برتبة: ${userRole}`);

    // 3. إعادة البيانات كاملة ومستقرة للواجهة الأمامية لتوجيهه فوراً
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح ومرحباً بك مجدداً',
      userId: authData.user.id,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: userName,
        role: userRole
      }
    });

  } catch (error: unknown) {
    console.error('❌ [LOGIN CRASH]:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ داخلي غير متوقع في خادم الموقع' }, { status: 500 });
  }
}
