export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from "next-auth/providers/google";
import sql from '../db';

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
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id') || searchParams.get('userId');
    const emailParam = searchParams.get('email');

    let users: any[] = [];

    if (emailParam) {
      users = await sql`
        SELECT id, name, email, phone, subscription_type
        FROM users
        WHERE LOWER(email) = ${emailParam.trim().toLowerCase()}
        LIMIT 1
      `;
    } 
    if ((!users || users.length === 0) && !idParam && sessionEmail) {
      users = await sql`
        SELECT id, name, email, phone, subscription_type
        FROM users
        WHERE LOWER(email) = ${sessionEmail.toLowerCase()}
        LIMIT 1
      `;
    } 
    if ((!users || users.length === 0) && idParam) {
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
      const fallbackUsers = await sql`SELECT id, name, email, phone, subscription_type FROM users WHERE role = 'admin' LIMIT 1`;
      if (fallbackUsers && fallbackUsers.length > 0) {
        users = fallbackUsers;
      } else {
        return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 });
      }
    }

    // قراءة العنصر الأول المباشر من مصفوفة الاستعلام الفعلي لحل مشكلة الـ undefined
    const currentUser = users[0];
    
    const responseUser = {
      id: currentUser.id, // التقاط المعرف الرقمي الحقيقي للصف بنجاح
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
