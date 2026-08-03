import { NextResponse } from 'next/server';
import sql from '../db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ success: false, message: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const userId = parseInt(idParam, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: 'معرف المستخدم غير صحيح' }, { status: 400 });
    }

    // 🚀 استعلام نظيف ومباشر من قاعدة بيانات Neon Postgres بجلب المعطيات والاشتراك المميز
    const users = await sql`
      SELECT id, name, email, phone, is_premium 
      FROM users 
      WHERE id = ${userId} 
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود بالنظام' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: users[0] });
  } catch (error: any) {
    console.error("Fetch user API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
