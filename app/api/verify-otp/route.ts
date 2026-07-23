import { NextResponse } from 'next/server';
import sql from '../db';

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json();

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني ورمز التحقق مطلوبان' },
        { status: 400 }
      );
    }

    // ✅ استخدام استعلام آمن مع SQL
    const users = await sql`
      SELECT id, email, otp_code, otp_expires_at, status 
      FROM users 
      WHERE email = ${email} AND status = 'pending'
    `;

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود أو تم التحقق منه بالفعل' },
        { status: 404 }
      );
    }

    const user = users[0];

    // ✅ التحقق من صلاحية OTP
    if (user.otp_code !== otpCode) {
      return NextResponse.json(
        { error: 'رمز التحقق غير صحيح' },
        { status: 400 }
      );
    }

    // ✅ التحقق من انتهاء الصلاحية
    const now = new Date();
    const expiry = new Date(user.otp_expires_at);
    if (now > expiry) {
      return NextResponse.json(
        { error: 'انتهت صلاحية رمز التحقق' },
        { status: 400 }
      );
    }

    // ✅ تفعيل الحساب
    await sql`
      UPDATE users 
      SET status = 'active', otp_code = NULL, otp_expires_at = NULL 
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'تم التحقق من الحساب بنجاح',
    });

  } catch (error) {
    console.error('❌ خطأ في التحقق من OTP:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق' },
      { status: 500 }
    );
  }
}
