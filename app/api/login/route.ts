import { NextResponse } from 'next/server';
import { db } from '../db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم في قاعدة البيانات
    const result = await db.query(
      `SELECT id, email, password, role, status 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // التحقق من كلمة المرور
    if (password !== user.password) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من حالة الحساب
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'الحساب غير مفعّل. يرجى التحقق من بريدك الإلكتروني' },
        { status: 403 }
      );
    }

    // التحقق من دور المستخدم
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'ليس لديك صلاحية الدخول إلى لوحة التحكم' },
        { status: 403 }
      );
    }

    // تسجيل الدخول ناجح
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
