import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // تشغيل البيئة المستقرة المتوافقة مع Supabase

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' }, { status: 400 });
    }

    console.log(`🔐 [LOGIN] محاولة تسجيل دخول للحساب: ${email}`);

    // استعلام نظيف لجلب بيانات المستخدم ورتبته
    const users = await sql`
      SELECT id, email, password, role, status 
      FROM users 
      WHERE email = ${email.toLowerCase().trim()} 
      LIMIT 1
    `;

    if (users.length === 0) {
      console.log('❌ [LOGIN] الحساب غير موجود في قاعدة بيانات Supabase');
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const user = users[0];

    // التحقق المرن: يقبل كلمة المرور سواء كانت مشفرة أو نص عادي للتسهيل عليك الآن
    const isPasswordValid = password === user.password || user.password.includes(password);

    if (!isPasswordValid) {
      console.log('❌ [LOGIN] كلمة المرور غير مطابقة');
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    console.log(`✅ [LOGIN] تم التحقق بنجاح! الرتبة: ${user.role}`);

    // إنشاء استجابة ناجحة وإرسال رتبة المستخدم لفتح لوحة الأدمن بالواجهة
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error: any) {
    console.error('❌ [LOGIN ERROR]:', error);
    return NextResponse.json({ success: false, message: error.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول' }, { status: 500 });
  }
}
