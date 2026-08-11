import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// إنشاء اتصال بقاعدة البيانات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM cars WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'السيارة غير موجودة' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, car: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('خطأ في جلب السيارة:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
