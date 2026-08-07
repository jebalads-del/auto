import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب المستخدمين النشطين حياً...');

    // التصفية السليمة وتجنب الكاش باستخدام متغير البحث
    const { searchParams } = new URL(request.url);
    const _revalidate = searchParams.get('_'); 

    const users = await sql`
      SELECT id, name, email, phone, subscription_type, created_at
      FROM users
      WHERE status IS NULL OR (status != 'deleted' AND status != 'banned')
      ORDER BY id DESC
    `;

    console.log(`✅ تم جلب ${users.length} مستخدم نشط`);

    const formattedUsers = users.map((user: any) => ({
      id: Number(user.id),
      name: String(user.name || 'غير معروف'),
      email: String(user.email || 'لا يوجد'),
      phone: String(user.phone || 'لا يوجد'),
      is_premium: Boolean(user.subscription_type === 'premium'),
      created_at: user.created_at || new Date().toISOString()
    }));

    return NextResponse.json(
      { success: true, users: formattedUsers },
      { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
    );
  } catch (error: any) {
    console.error('❌ خطأ في جلب المستخدمين:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب المستخدمين', error: error.message },
      { status: 500 }
    );
  }
}
