import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db';

export const dynamic = 'force-dynamic';

// 1. جلب المستخدمين النشطين فقط واستثناء المحذوفين
export async function GET() {
  try {
    const users = await sql`
      SELECT id, name, email, phone, subscription_type, status, created_at
      FROM users
      WHERE status IS NULL OR (
        LOWER(status) != 'deleted' 
        AND LOWER(status) != 'banned' 
        AND status != 'محذوف'
      )
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

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// 2. معالجة زر الحذف بذكاء لتجنب قيود العلاقات وقفل الحساب فوراً
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: 'معرف المستخدم مطلوب' });

    // بدلاً من الحذف الفعلي المرفوض برمجياً، نغير حالته ليختفي للأبد
    await sql`UPDATE users SET status = 'deleted' WHERE id = ${id}`;
    
    return NextResponse.json({ success: true, message: '🗑️ تم حذف وتصفية المستخدم بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'فشل الحذف: ' + error.message });
  }
}
