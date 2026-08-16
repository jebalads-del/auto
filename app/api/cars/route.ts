export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import sql from '../db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    // جلب سيارة محددة بواسطة الـ id الخاص بها وعرض مصفوفتها كاملة للواجهة الفاخرة
    if (idParam) {
      const carId = parseInt(idParam, 10);
      if (isNaN(carId)) {
        return NextResponse.json({ success: false, message: 'معرف السيارة غير صحيح' }, { status: 400 });
      }

      const cars = await sql`
        SELECT id, brand, model, year, price, kilometers, color, description, images, status, currency
        FROM cars
        WHERE id = ${carId}
        LIMIT 1
      `;

      if (!cars || cars.length === 0) {
        return NextResponse.json({ success: false, message: 'السيارة غير موجودة' }, { status: 404 });
      }

      // إرجاع العنصر الأول مباشرة لحل مشاكل الـ undefined والـ 404 في صفحة التفاصيل
      return NextResponse.json({ success: true, car: cars[0] });
    }

    // جلب كافة السيارات المعتمدة والمقبولة من الأدمن لعرضها حياً في صالة العرض
    const approvedCars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, description, images, status, currency
      FROM cars
      WHERE LOWER(status) = 'approved'
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, cars: approvedCars });

  } catch (error: any) {
    console.error('GET Cars API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brand, model, year, price, kilometers, currency, color, description, images, user_email } = body;

    if (!brand || !model || !year || !price) {
      return NextResponse.json({ success: false, message: 'البيانات الأساسية مطلوبة' }, { status: 400 });
    }

    // إدخال الإعلان الجديد حياً ومباشراً في قاعدة البيانات وحفظ نصوص الصور المرفوعة بأمان كامل وبحالة pending بانتظار الأدمن
    const newCar = await sql`
      INSERT INTO cars (brand, model, year, price, kilometers, currency, color, description, images, user_email, status)
      VALUES (${brand}, ${model}, ${year}, ${price}, ${kilometers || 0}, ${currency || 'KWD'}, ${color || ''}, ${description || ''}, ${images || ''}, ${user_email || ''}, 'pending')
      RETURNING id
    `;

    return NextResponse.json({ success: true, message: 'تم إرسال الإعلان بنجاح وجاري مراجعته', carId: newCar[0].id });

  } catch (error: any) {
    console.error('POST Cars API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'المعرف والحالة مطلوبان' }, { status: 400 });
    }

    const updated = await sql`
      UPDATE cars
      SET status = ${status}
      WHERE id = ${parseInt(id, 10)}
      RETURNING id
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, message: 'لم يتم العثور على السيارة لتحديثها' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم تحديث حالة السيارة بنجاح حياً!' });

  } catch (error: any) {
    console.error('PUT Cars API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
