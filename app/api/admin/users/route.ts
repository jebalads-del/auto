import { NextResponse } from 'next/server';
import sql from '../../../lib/db';

export const dynamic = 'force-dynamic';

// 1. دالة جلب المستخدمين (محدثة لتجلب الحالات بدقة)
export async function GET() {
  try {
    const users = await sql`
      SELECT id, name, email, role, status, created_at
      FROM users
      WHERE status IS NULL OR status != 'deleted'
      ORDER BY id DESC
    `;

    const formattedUsers = users.map((user: any) => ({
      id: Number(user.id),
      name: String(user.name || 'غير معروف'),
      email: String(user.email || 'لا يوجد'),
      role: String(user.role || 'user'),
      status: String(user.status || 'active'),
      created_at: user.created_at || new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'فشل في جلب البيانات من السيرفر', error: error.message },
      { status: 500 }
    );
  }
}

// 2. دالة التحكم بالإجراءات (حذف، تفعيل، تعطيل)
export async function POST(request: Request) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ success: false, message: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }

    // لمنع حذف المدراء بالخطأ وتأمين النظام
    const [checkUser] = await sql`SELECT role FROM users WHERE id = ${userId}`;
    if (checkUser && checkUser.role === 'admin' && action === 'delete') {
      return NextResponse.json({ success: false, message: 'لا يمكن حذف حساب المدير العام' }, { status: 403 });
    }

    if (action === 'delete') {
      // حذف ناعم (Soft Delete) لتجنب كسر العلاقات بقواعد البيانات أو حذف نهائي حسب هيكلة جدولك
      await sql`UPDATE users SET status = 'deleted' WHERE id = ${userId}`;
      return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح من النظام' });
    } 
    
    if (action === 'activate') {
      await sql`UPDATE users SET status = 'active' WHERE id = ${userId}`;
      return NextResponse.json({ success: true, message: 'تم تفعيل حساب المستخدم بنجاح' });
    } 
    
    if (action === 'deactivate') {
      await sql`UPDATE users SET status = 'inactive' WHERE id = ${userId}`;
      return NextResponse.json({ success: true, message: 'تم إيقاف حساب المستخدم بنجاح' });
    }

    return NextResponse.json({ success: false, message: 'الإجراء المطلوب غير مدعوم' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'فشل تنفيذ الإجراء في قاعدة البيانات', error: error.message },
      { status: 500 }
    );
  }
}
