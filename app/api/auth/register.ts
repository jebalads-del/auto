import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'البريد مطلوب' }, { status: 400 });
    }

    // هنا أضف منطق إرسال OTP عبر Resend
    // مثلاً: await resend.emails.send({ ... })

    return NextResponse.json({ message: 'تم إرسال الكود' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
