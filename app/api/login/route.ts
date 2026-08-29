import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db'; // ✅ العودة لاستخدام الاتصال الموحد المستقر والمحمي بموقعك

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

    const currentEmail = email.toLowerCase().trim();
    console.log(`🔐 [LOGIN] محاولة تسجيل دخول للبريد: ${currentEmail}`);

    let userRole = 'user';
    let userId = '1';
    let userEmail = currentEmail;

    // ⚠️ [ADMIN BYPASS SECURITY]: جدار الأمان والقفل الملكي لتخطي أي حظر سحابي معلق للأدمن
    if (currentEmail === 'admin@sayarty.store' && password === '12345678') {
      userRole = 'admin';
      userId = 'admin-consolidated-uuid-session';
      console.log(`⚡ [ADMIN BYPASS] تم تمرير وتوثيق دخول المدير العام للموقع فوراً ومباشرة`);
    } else {
      // للمتصفحين والمستخدمين العاديين: التحقق الأمني الطبيعي من قاعدة بيانات سوبابيس الحية
      const { data, error } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: password,
      });

      if (error || !data.user) {
        console.error('❌ [AUTH ERROR]:', error?.message);
        return NextResponse.json(
          { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }

      userId = data.user.id;
      userEmail = data.user.email || currentEmail;

      // فحص رتبة الحساب من الجدول العام
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (dbUser) {
          userRole = dbUser.role || 'user';
        }
      } catch (e) {
        // إذا كان الحساب يملك رتبة أدمن مسبقاً في شروط الإيميل
        if (currentEmail === 'mara7b@gmail.com') {
          userRole = 'admin';
        }
      }
    }

    // إعادة النتيجة كاملة ومستقرة ومطابقة لشروط واجهتك الأمامية
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userEmail,
        role: userRole,
        status: 'active'
      }
    });

  } catch (error: any) {
    console.error('❌ [LOGIN CRASH]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ غير متوقع في خادم الموقع' },
      { status: 500 }
    );
  }
}
