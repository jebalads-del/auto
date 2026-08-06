export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// إعداد الاتصال المباشر بـ Neon
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const cars = await sql`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM cars c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;
    return NextResponse.json({ success: true, data: cars });
  } catch (error) {
    console.error('خطأ في جلب السيارات:', error);
    return NextResponse.json(
      { success: false, message: 'خطأ في جلب البيانات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { 
      brand, model, year, price, kilometers, color,
      fuel_type, transmission, description, images,
      user_id, phone, city, category
    } = body;

    const result = await sql`
      INSERT INTO cars (
        brand, model, year, price, kilometers, color,
        fuel_type, transmission, description, images,
        user_id, phone, city, category, status
      ) VALUES (
        ${brand}, ${model}, ${year}, ${price}, ${kilometers}, ${color},
        ${fuel_type}, ${transmission}, ${description}, ${images},
        ${user_id}, ${phone}, ${city}, ${category}, 'pending'
      ) RETURNING id
    `;

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error('خطأ في إضافة السيارة:', error);
    return NextResponse.json(
      { success: false, message: 'فشل إضافة السيارة' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'معرف السيارة مطلوب' },
        { status: 400 }
      );
    }

    const targetStatus = status || 'Approved';
    const carId = Number(id);

    await sql`
      UPDATE cars 
      SET status = ${targetStatus}
      WHERE id = ${carId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error inside admin cars PUT:", error);
    return NextResponse.json(
      { success: false, message: 'فشل تحديث الحالة' },
      { status: 500 }
    );
  }
}
