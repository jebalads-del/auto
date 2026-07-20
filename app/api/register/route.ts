import { NextResponse } from 'next/server';
import sql from '../db';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'الرجاء ملء جميع الحقول!' }, { status: 400 });

    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) return NextResponse.json({ error: 'البريد الإلكتروني مسجل بالفعل!' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await sql`INSERT INTO users (name, email, password, otp_code, status) VALUES (${name}, ${email}, ${hashedPassword}, ${otpCode}, 'pending')`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: '"سيارتي" <no-reply@sayarty.store>',
      to: email,
      subject: 'رمز تفعيل حسابك - سيارتي',
      html: `<h1>${otpCode}</h1>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
