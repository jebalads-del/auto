import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'معرف غير صالح' },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT id, name, email, role, status, phone, created_at
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدم:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    );
  }
}
