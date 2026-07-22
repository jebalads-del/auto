import { NextResponse } from 'next/server';
import sql from '../../db';

export async function GET() {
  try {
    const cars = await sql`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM cars c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json({ success: true, cars });
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الإعلانات' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { 
      marca, model, year, price, mileage, color, 
      description, images, user_id, payment_method 
    } = await request.json();

    if (!marca || !model || !price) {
      return NextResponse.json(
        { success: false, message: 'الماركة، الموديل، والسعر مطلوبة' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO cars (
        marca, model, year, price, mileage, color, 
        description, images, user_id, payment_method, status
      ) VALUES (
        ${marca}, ${model}, ${year}, ${price}, ${mileage}, ${color},
        ${description}, ${images}, ${user_id}, ${payment_method}, 'pending'
      )
      RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      car: result[0],
      message: 'تم إرسال الإعلان للمراجعة' 
    });

  } catch (error) {
    console.error('خطأ في إنشاء الإعلان:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء الإعلان' },
      { status: 500 }
    );
  }
}
