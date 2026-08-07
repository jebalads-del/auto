export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import sql from '../../db';

export async function POST(request: Request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من المستخدم وكلمة المرور الحالية
    const users = await sql`
      SELECT id, password FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    const user = users[0];

    // التحقق من كلمة المرور الحالية
    if (currentPassword !== user.password) {
      return NextResponse.json(
        { success: false, message: 'كلمة المرور الحالية غير صحيحة' },
        { status: 400 }
      );
    }

    // تحديث كلمة المرور
    await sql`
      UPDATE users 
      SET password = ${newPassword}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    });
  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تغيير كلمة المرور' },
      { status: 500 }
    );
  }
}
