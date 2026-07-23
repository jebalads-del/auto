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

    const users = await sql`
      SELECT id, reset_otp, reset_otp_expires_at 
      FROM users 
      WHERE email = ${email}
    `;

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    const user = users[0];

    const dbOtp = String(user.reset_otp).trim();
    const inputOtp = String(otpCode).trim();

    if (dbOtp !== inputOtp) {
      return NextResponse.json(
        { error: 'الكود غير صحيح' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiry = new Date(user.reset_otp_expires_at);
    if (now > expiry) {
      return NextResponse.json(
        { error: 'انتهت صلاحية الكود' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم التحقق من الكود بنجاح',
    });

  } catch (error) {
    console.error('❌ خطأ في التحقق من كود إعادة التعيين:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق' },
      { status: 500 }
    );
  }
}
