import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db'; // استخدم الدالة الجديدة

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // استخدام الدالة للحصول على اتصال قاعدة البيانات
    const sql = getSql();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' }, { status: 400 });
    }

    console.log(`🔐 [LOGIN] محاولة تسجيل دخول للحساب: ${email}`);

    const users = await sql`
      SELECT id, email, password, role, status 
      FROM users 
      WHERE email = ${email.toLowerCase().trim()} 
      LIMIT 1
    `;

    if (users.length === 0) {
      console.log('❌ [LOGIN] الحساب غير موجود');
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const user = users[0];
    const isPasswordValid = password === user.password || user.password.includes(password);

    if (!isPasswordValid) {
      console.log('❌ [LOGIN] كلمة المرور غير مطابقة');
      return NextResponse.json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    console.log(`✅ [LOGIN] تم التحقق بنجاح! الرتبة: ${user.role}`);

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
    return NextResponse.json({ success: false, message: error.message || 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
