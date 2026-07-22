import { NextResponse } from 'next/server';
import sql from '../../../../db';

export async function POST(
  request: Request,
  { params }: { params: { action: string } }
) {
  try {
    const { userId } = await request.json();
    const { action } = params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    let query = null;
    let message = '';

    switch (action) {
      case 'activate':
        query = sql`
          UPDATE users 
          SET status = 'active' 
          WHERE id = ${userId}
        `;
        message = 'تم تفعيل المستخدم بنجاح';
        break;

      case 'deactivate':
        query = sql`
          UPDATE users 
          SET status = 'inactive' 
          WHERE id = ${userId}
        `;
        message = 'تم إيقاف المستخدم بنجاح';
        break;

      case 'delete':
        const adminCheck = await sql`
          SELECT email FROM users WHERE id = ${userId}
        `;
        if (adminCheck.length > 0 && adminCheck[0].email === 'admin@sayarty.store') {
          return NextResponse.json(
            { success: false, message: 'لا يمكن حذف حساب الأدمن الرئيسي' },
            { status: 403 }
          );
        }
        query = sql`
          DELETE FROM users WHERE id = ${userId}
        `;
        message = 'تم حذف المستخدم بنجاح';
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'إجراء غير معروف' },
          { status: 400 }
        );
    }

    if (query) {
      await query;
    }
    return NextResponse.json({ success: true, message });

  } catch (error) {
    console.error('خطأ في التحكم بالمستخدم:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تنفيذ الإجراء' },
      { status: 500 }
    );
  }
}
