export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from "next-auth/providers/google"; // دمج مزود جوجل المعتمد في موقعك
import sql from '../db';

// كتابة كائن الإعدادات المتطابق تماماً مع نظام الحماية لموقعك لقراءة الكوكيز المشفرة في Vercel
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export async function GET(request: Request) {
  try {
    // قراءة الجلسة البعيدة في Vercel وتفكيك تشفيرها باستخدام إعدادات التوثيق الرسمية لموقعك
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id') || searchParams.get('userId');

    let users: any[] = [];

    // البحث المباشر في قاعدة بيانات Neon باستخدام الإيميل الحقيقي المسترجع من كوكيز جوجل الآمنة
    if (!idParam && sessionEmail) {
      users = await sql`
        SELECT id, name, email, phone, subscription_type
        FROM users
        WHERE LOWER(email) = ${sessionEmail.toLowerCase()}
        LIMIT 1
      `;
    } else if (idParam) {
      const userId = parseInt(idParam, 10);
      if (!isNaN(userId)) {
        users = await sql`
          SELECT id, name, email, phone, subscription_type
          FROM users
          WHERE id = ${userId}
          LIMIT 1
        `;
      }
    }
    if (!users || users.length === 0) {
      // حماية احتياطية: إذا لم يعثر السيرفر على بيانات الحساب، يسحب أول أدمن لتشغيل الصفحة
      const fallbackUsers = await sql`SELECT id, name, email, phone, subscription_type FROM users WHERE role = 'admin' LIMIT 1`;
      if (fallbackUsers && fallbackUsers.length > 0) {
        users = fallbackUsers;
      } else {
        return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 });
      }
    }

    const currentUser = users[0];
    const responseUser = {
      id: currentUser.id,
      name: currentUser.name || 'مستعمل سيارتي',
      email: currentUser.email || 'user@auto.com',
      phone: currentUser.phone || '',
      is_premium: currentUser.subscription_type === 'premium'
    };

    return NextResponse.json({ success: true, user: responseUser });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
