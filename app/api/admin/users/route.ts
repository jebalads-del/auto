import { NextResponse } from 'next/server';
import sql from '../../db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, name, email, phone, subscription_type, created_at
      FROM users
      WHERE status IS NULL OR (status != 'deleted' AND status != 'banned')
      ORDER BY id DESC
    `;

    const formattedUsers = users.map((user: any) => ({
      id: Number(user.id),
      name: String(user.name || 'غير معروف'),
      email: String(user.email || 'لا يوجد'),
      phone: String(user.phone || 'لا يوجد'),
      is_premium: Boolean(user.subscription_type === 'premium'),
      created_at: user.created_at || new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'حدث خطأ', error: error.message },
      { status: 500 }
    );
  }
}
