import { NextResponse } from 'next/server';
import sql from '../db';

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json();
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users || users.length === 0) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    const user = users[0];
    if (user.otp_code === otpCode) {
      await sql`UPDATE users SET status = 'active', otp_code = null WHERE email = ${email}`;
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
