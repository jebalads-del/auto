import { NextResponse } from 'next/server';
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
  }
}
