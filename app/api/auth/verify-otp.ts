import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'البريد والكود مطلوبان' }, { status: 400 });
    }

    // هنا أضف منطق التحقق من OTP

    return NextResponse.json({ message: 'تم التحقق بنجاح' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
