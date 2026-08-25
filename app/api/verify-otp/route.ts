import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json({ error: 'رمز التحقق مطلوب' }, { status: 400 });
    }

    // 1. جلب الرمز المتولد المشفّر المسجل في الكوكيز أثناء عملية التسجيل
    const cookieStore = cookies();
    const savedOtp = cookieStore.get('register_otp')?.value;

    if (!savedOtp) {
      return NextResponse.json({ error: 'انتهت صلاحية الرمز، يرجى إعادة الإرسال من جديد' }, { status: 400 });
    }

    // 2. مقارنة الرمز الذي أدخله المستخدم بالرمز الحقيقي المخزن في السيرفر
    if (otp !== savedOtp) {
      return NextResponse.json({ error: 'الرمز المدخل غير صحيح' }, { status: 400 });
    }

    // 3. مسح الكوكيز بعد نجاح التحقق لإلغاء صلاحية الرمز القديم وأمان المنظومة
    const response = NextResponse.json({ success: true });
    response.cookies.delete('register_otp');
    
    return response;

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
=======
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
>>>>>>> 2b1e27f18d7beee545ea3bba83a1065c5a49da78
  }
}
