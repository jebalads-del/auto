import { NextResponse } from 'next/server';
import sql from '../db';

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json();

    console.log('📩 طلب التحقق:', { email, otpCode });

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني ورمز التحقق مطلوبان' },
        { status: 400 }
      );
    }

    // ✅ البحث عن المستخدم
    const result = await sql`
      SELECT id, email, otp_code, otp_expires_at, status 
      FROM users 
      WHERE email = ${email} AND status = 'pending'
    `;

    console.log('🔍 نتيجة البحث:', result);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود أو تم التحقق منه بالفعل' },
        { status: 404 }
      );
    }

    const user = result[0];

    console.log('🔍 OTP في قاعدة البيانات:', user.otp_code, 'type:', typeof user.otp_code);
    console.log('🔍 OTP المدخل:', otpCode, 'type:', typeof otpCode);

    // ✅ مقارنة الأرقام (تحويل إلى String للتأكد)
    const dbOtp = String(user.otp_code).trim();
    const inputOtp = String(otpCode).trim();

    console.log('🔍 بعد التحويل:', { dbOtp, inputOtp });

    if (dbOtp !== inputOtp) {
      return NextResponse.json(
        { error: 'رمز التحقق غير صحيح' },
        { status: 400 }
      );
    }

    // ✅ التحقق من صلاحية OTP
    const now = new Date();
    const expiry = new Date(user.otp_expires_at);

    if (now > expiry) {
      return NextResponse.json(
        { error: 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد' },
        { status: 400 }
      );
    }

    // ✅ تفعيل الحساب
    await sql`
      UPDATE users 
      SET status = 'active', otp_code = NULL, otp_expires_at = NULL 
      WHERE id = ${user.id}
    `;

    console.log('✅ تم تفعيل المستخدم:', email);

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
