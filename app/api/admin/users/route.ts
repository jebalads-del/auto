import { NextResponse } from 'next/server';
import sql from '../../../db';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, name, email, role, status, created_at 
      FROM users 
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب المستخدمين' },
      { status: 500 }
    );
  }
}
