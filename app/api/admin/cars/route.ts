import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// الاتصال بقاعدة البيانات
const sql = neon(process.env.DATABASE_URL!);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف السيارة مطلوب' }, { status: 400 });
    }

    // تحديث الحالة
    await sql`
      UPDATE cars 
      SET status = ${status}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true, message: 'تم تحديث الحالة بنجاح' });
  } catch (error) {
    console.error('خطأ في تحديث السيارة:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث الحالة' },
      { status: 500 }
    );
  }
}
