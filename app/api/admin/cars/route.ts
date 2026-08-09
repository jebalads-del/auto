import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawCars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, description, images, status, currency, created_at
      FROM cars
      WHERE status IS NULL OR status != 'deleted'
      ORDER BY id DESC
    `;

    const formattedCars = rawCars.map((car: any) => ({
      id: car.id,
      brand: String(car.brand || 'غير معروف'),
      model: String(car.model || ''),
      year: Number(car.year || 0),
      price: Number(car.price || 0),
      kilometers: Number(car.kilometers || 0),
      color: String(car.color || ''),
      description: String(car.description || ''),
      // قراءة الحقل النصي مباشرة لضمان ظهور الصور للأدمن والزوار بالتوازي
      images: car.images ? String(car.images).trim() : '',
      status: String(car.status || 'pending'),
      created_at: car.created_at || new Date().toISOString(),
      currency: String(car.currency || 'د.أ')
    }));

    return NextResponse.json({ success: true, cars: formattedCars });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'خطأ في جلب السيارات للأدمن', error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, action } = body; 

    if (!carId) return NextResponse.json({ success: false, error: 'معرف السيارة مفقود' }, { status: 400 });

    let targetStatus = 'pending';
    if (action === 'approve') targetStatus = 'approved';
    else if (action === 'reject') targetStatus = 'rejected';
    else if (action === 'delete') targetStatus = 'deleted';

    await sql`UPDATE cars SET status = ${targetStatus} WHERE id = ${carId}`;

    return NextResponse.json({ success: true, message: 'تم تحديث حالة الإعلان بنجاح بنظام Neon' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// force rebuild API update
