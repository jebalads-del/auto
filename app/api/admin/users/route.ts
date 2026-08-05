import { NextResponse } from 'next/server';
import sql from '../../db';

export async function GET() {
  try {
    console.log('📊 جلب جميع المستخدمين...');
    
    const users = await sql`
      SELECT id, name, email, phone, subscription_type, created_at
      FROM users
      ORDER BY id DESC
    `;

    console.log(`✅ تم العثور على ${users.length} مستخدم`);

    // تنسيق البيانات لتناسب صفحة الأدمن
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name || 'غير معروف',
      email: user.email || 'لا يوجد',
      phone: user.phone || 'لا يوجد',
      is_premium: user.subscription_type === 'premium',
      created_at: user.created_at
    }));

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
