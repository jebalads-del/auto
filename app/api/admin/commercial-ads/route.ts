import { NextResponse } from 'next/server';
import sql from '../../db';

export async function GET() {
  try {
    const ads = await sql`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM commercial_ads c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json({ success: true, ads });
  } catch (error) {
    console.error('خطأ في جلب طلبات الإعلانات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}
