export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import sql from '../db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

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

      return NextResponse.json({ success: true, car: cars[0] });
    }

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
    // ترقية السيرفر ليقرأ البيانات القادمة بنظام الـ FormData (الملفات الحية)
    const formData = await request.formData();
    
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const year = formData.get('year') as string;
    const price = formData.get('price') as string;
    const kilometers = formData.get('kilometers') as string;
    const currency = formData.get('currency') as string;
    const color = formData.get('color') as string;
    const description = formData.get('description') as string;
    const user_email = formData.get('user_email') as string;

    if (!brand || !model || !year || !price) {
      return NextResponse.json({ success: false, message: 'البيانات الأساسية مطلوبة' }, { status: 400 });
    }

    // التقاط مصفوفة ملفات الصور المرفوعة حركياً من الهاتف
    const files = formData.getAll('files') as File[];
    const imageUrls: string[] = [];

    // معالجة الصور المرفوعة وتحويلها إلى أكواد نصية خفيفة ومدمجة ومحمية لتخزينها في قاعدة البيانات بأمان كلي
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
      imageUrls.push(base64Image);
    }

    const finalImagesString = imageUrls.join(',');

    // إدخال الإعلان الجديد حياً ومباشراً في قاعدة بيانات Neon مع معرض الصور الحية بنجاح باهر
    const newCar = await sql`
      INSERT INTO cars (brand, model, year, price, kilometers, currency, color, description, images, user_email, status)
      VALUES (${brand}, ${model}, ${parseInt(year, 10)}, ${parseFloat(price)}, ${parseInt(kilometers, 10) || 0}, ${currency || 'KWD'}, ${color || ''}, ${description || ''}, ${finalImagesString}, ${user_email || ''}, 'pending')
      RETURNING id
    `;

    return NextResponse.json({ success: true, message: 'تم إرسال الإعلان بنجاح وجاري مراجعته من قبل الإدارة', carId: newCar[0].id });

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
