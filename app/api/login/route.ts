import { NextResponse } from 'next/server';
import sql from '../db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT id, email, password, role, status 
      FROM users 
      WHERE email = ${email}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const user = result[0];

    if (password !== user.password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'الحساب غير مفعّل. يرجى التحقق من بريدك الإلكتروني' },
        { status: 403 }
      );
    }

    // ✅ السماح للجميع، لكن توجيه المستخدم العادي إلى صفحة مختلفة
if (user.role === 'admin') {
  // توجيه إلى لوحة التحكم
  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role },
    redirect: '/dashboard'
  });
} else {
  // توجيه المستخدم العادي إلى صفحة الإعلانات أو الملف الشخصي
  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role },
    redirect: '/'
  });
}

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
