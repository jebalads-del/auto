import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'البريد والرمز مطلوبان' },
        { status: 400 }
      );
    }

    // الحصول على الـ OTP المحفوظ من الكوكيز
    const cookieStore = cookies();
    const storedOtp = cookieStore.get('register_otp')?.value;

    if (!storedOtp) {
      return NextResponse.json(
        { success: false, error: 'انتهت صلاحية الرمز، حاول مجدداً' },
        { status: 400 }
      );
    }

    // التحقق من تطابق الرمز
    if (otp !== storedOtp) {
      return NextResponse.json(
        { success: false, error: 'الرمز المدخل غير صحيح' },
        { status: 400 }
      );
    }

    // نجاح التحقق - حذف الكوكيز
    const response = NextResponse.json({
      success: true,
      message: 'تم التحقق بنجاح'
    });

    response.cookies.delete('register_otp');
    return response;

  } catch (err: any) {
    console.error('❌ خطأ في التحقق:', err);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
