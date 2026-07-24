import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const carId = parseInt(id);

    if (isNaN(carId)) {
      return NextResponse.json(
        { success: false, message: 'معرف غير صالح' },
        { status: 400 }
      );
    }

    const cars = await sql`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM cars c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ${carId} AND c.status = 'approved'
    `;

    if (cars.length === 0) {
      return NextResponse.json(
        { success: false, message: 'الإعلان غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, car: cars[0] });
  } catch (error) {
    console.error('خطأ في جلب تفاصيل السيارة:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب التفاصيل' },
      { status: 500 }
    );
  }
}