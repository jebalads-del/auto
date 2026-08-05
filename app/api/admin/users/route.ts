import { NextResponse } from 'next/server';
import sql from '../../db';

export async function GET() {
  try {
    console.log('🔄 جلب المستخدمين...');
    
    const users = await sql`
      SELECT id, name, email, phone, subscription_type, created_at
      FROM users
      ORDER BY id DESC
    `;

    console.log(`✅ تم جلب ${users.length} مستخدم`);

    // تنسيق البيانات لتناسب صفحة الأدمن
    const formattedUsers = users.map((user: any) => ({
      id: Number(user.id),
      name: String(user.name || 'غير معروف'),
      email: String(user.email || 'لا يوجد'),
      phone: String(user.phone || 'لا يوجد'),
      is_premium: Boolean(user.subscription_type === 'premium'),
      created_at: user.created_at || new Date().toISOString()
    }));

    // إرجاع البيانات مع success: true
    return NextResponse.json({ 
      success: true, 
      users: formattedUsers 
    });
  } catch (error: any) {
    console.error('❌ خطأ في جلب المستخدمين:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'حدث خطأ أثناء جلب المستخدمين',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
