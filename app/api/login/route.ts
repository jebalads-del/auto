import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'الرجاء ملء جميع الحقول المطلوبة' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log(`🔐 [LOGIN PROCESS] محاولة تسجيل دخول للبريد: ${cleanEmail}`);

    // 1. التحقق الأمني المشفر والمباشر من البريد وكلمة السر داخل Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (authError || !authData.user) {
      console.error('❌ [AUTH ERROR]:', authError?.message);
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة!' },
        { status: 401 }
      );
    }

    // 2. تعيين القيم الافتراضية
    let userRole = 'user';
    let userName = 'مستخدم جديد';

    // 3. تأمين صارم وقاطع للأدمن: إذا كان البريد هو بريد الأدمن، نمنحه الصلاحيات فوراً دون فحص الجدول العام لتفادي الانهيار
    if (cleanEmail === 'admin@sayarty.store') {
      userRole = 'admin';
      userName = 'المدير العام';
      
      // مزامنة أوتوماتيكية سريعة لربط الـ UUID الجديد في الجدول العام صيانة للنظام
      try {
        await supabase.from('users').insert([{ id: authData.user.id, email: cleanEmail, name: userName, role: userRole, status: 'active' }]).onConflict('id').ignore();
      } catch (e) {}

    } else {
      // للمستخدمين العاديين: جلب البيانات بشكل آمن ومحمي بدون كراش الـ single()
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('name, role')
          .eq('id', authData.user.id);
          
        if (dbUser && dbUser.length > 0) {
          userRole = dbUser[0].role || 'user';
          userName = dbUser[0].name || userName;
        }
      } catch (tableError) {
        console.error('خطأ جدول المستخدمين:', tableError);
      }
    }

    console.log(`✅ [LOGIN SUCCESS] تم تسجيل دخول ${userName} برتبة: ${userRole}`);

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
