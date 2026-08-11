import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'معرف غير صحيح' },
        { status: 400 }
      );
    }

    const { rows } = await sql`
      SELECT * FROM cars WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'السيارة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, car: rows[0] });
  } catch (error) {
    console.error('خطأ في جلب السيارة:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
