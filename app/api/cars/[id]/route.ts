import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
      // ✅ أهم تعديل: إضافة حقل `images` إلى الاستعلام
      const result = await client.query(
        `SELECT
          id, brand, model, year, price, kilometers,
          color, description, images, status, is_featured, currency, created_at
         FROM cars
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'السيارة غير موجودة' },
          { status: 404 }
        );
      }

      const car = result.rows[0];

      // ✅ إعادة البيانات مع `images`
      return NextResponse.json({
        success: true,
        car: {
          ...car,
          images: car.images || '',
        }
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('خطأ في جلب السيارة:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
