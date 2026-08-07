import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// هذا الكود سيقوم بفحص قاعدة البيانات أولاً لمعرفة الأسماء الصحيحة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // 1. نتحقق أولاً من وجود الجدول والأعمدة الصحيحة
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cars'
      ) as table_exists
    `;

    // 2. إذا لم يجد جدولاً اسمه cars، سيجرب Cars
    let tableName = 'cars';
    if (!tableCheck[0]?.table_exists) {
      const checkCapital = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Cars'
        ) as table_exists
      `;
      if (checkCapital[0]?.table_exists) {
        tableName = 'Cars';
      } else {
        return NextResponse.json({ 
          error: 'لم أجد جدول السيارات (cars أو Cars). يرجى التحقق من اسم الجدول في قاعدة بيانات Neon' 
        }, { status: 404 });
      }
    }

    // 3. تنفيذ التحديث باستخدام اسم الجدول الصحيح
    const query = `UPDATE ${tableName} SET status = $1 WHERE id = $2 RETURNING id`;
    const result = await sql.query(query, [status, id]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'السيارة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم التحديث بنجاح' });
  } catch (error: any) {
    console.error('تفاصيل الخطأ:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ غير معروف في السيرفر' },
      { status: 500 }
    );
  }
}
