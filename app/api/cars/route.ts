import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawCars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, description, images, status, currency, created_at 
      FROM cars 
      WHERE status = 'approved' 
      ORDER BY id DESC
    `;
    const formattedCars = rawCars.map((car: any) => ({
      id: Number(car.id), 
      brand: String(car.brand || 'سيارة غير معروفة'),
      model: String(car.model || ''),
      year: Number(car.year || 0),
      price: Number(car.price || 0),
      kilometers: Number(car.kilometers || 0),
      color: String(car.color || ''),
      description: String(car.description || ''),
      images: car.images ? String(car.images).trim() : '', 
      status: String(car.status || 'pending'),
      created_at: car.created_at || new Date().toISOString(),
      currency: String(car.currency || 'SAR')
    }));
    return NextResponse.json({ success: true, cars: formattedCars });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let brand = "", model = "", year = "", price = "";
    let kilometers = "", color = "", description = "", user_id = "";
    let payment_method = "", is_featured = false, rawImages: any = null;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      brand = formData.get('brand') as string || '';
      model = formData.get('model') as string || '';
      year = formData.get('year') as string || '';
      price = formData.get('price') as string || '0';
      kilometers = formData.get('kilometers') as string || '';
      color = formData.get('color') as string || '';
      description = formData.get('description') as string || '';
      user_id = formData.get('user_id') as string || '';
      payment_method = formData.get('payment_method') as string || 'western';
      is_featured = formData.get('is_featured') === 'true';
      // التقاط كائن ملف الصورة الحقيقي بشكل دقيق
      rawImages = formData.get('image') || formData.get('images');
    } else {
      const body = await request.json();
      brand = body.brand || '';
      model = body.model || '';
      year = body.year || '';
      price = body.price || '0';
      kilometers = body.kilometers || '';
      color = body.color || '';
      description = body.description || '';
      user_id = body.user_id || '';
      payment_method = body.payment_method || 'western';
      is_featured = !!body.is_featured;
      rawImages = body.images || body.image_url;
    }

    let finalImageUrl = "";

    // معالجة قاطعة لملفات الصور الحقيقية المرفوعة من الهاتف (مثل خطأ الملف المذكور)
    if (rawImages && typeof rawImages === 'object' && typeof rawImages.arrayBuffer === 'function') {
      const blobFilename = `car-${Date.now()}-${rawImages.name || 'photo.png'}`;
      const buffer = Buffer.from(await rawImages.arrayBuffer());
      
      const blobResult = await put(blobFilename, buffer, {
        access: 'public',
        contentType: rawImages.type || 'image/png'
      });
      finalImageUrl = blobResult.url;
    } 
    // فحص إضافي محمي في حال تم إرسالها كـ base64 نصي
    else if (rawImages && typeof rawImages === 'string' && rawImages.startsWith('data:image')) {
      const commaIndex = rawImages.indexOf(',');
      if (commaIndex !== -1) {
        const base64Header = rawImages.substring(0, commaIndex);
        const base64Content = rawImages.substring(commaIndex + 1);
        const mimeMatch = base64Header.match(/data:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const extension = mimeType.split('/')[1] || 'jpg';
        const buffer = Buffer.from(base64Content, 'base64');
        const blobFilename = `car-${Date.now()}.${extension}`;
        const blobResult = await put(blobFilename, buffer, { access: 'public', contentType: mimeType });
        finalImageUrl = blobResult.url;
      }
    } else if (typeof rawImages === 'string') {
      finalImageUrl = rawImages;
    }

    const result = await sql`
      INSERT INTO cars (user_id, brand, model, year, color, kilometers, description, price, images, status, is_featured, payment_method)
      VALUES (${user_id ? Number(user_id) : null}, ${brand}, ${model}, ${year ? Number(year) : null}, ${color}, ${kilometers ? Number(kilometers) : null}, ${description}, ${price ? Number(price) : 0}, ${finalImageUrl}, 'pending', ${is_featured}, ${payment_method})
      RETURNING *
    `;

    const insertedCar = result[0] || result;
    const carId = insertedCar ? Number(insertedCar.id) : null;

    return NextResponse.json({ 
      success: true, 
      id: carId,
      carId: carId,
      data: { id: carId, ...insertedCar },
      car: insertedCar
    });

  } catch (error: any) {
    console.error("Error creating car ad:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    const carId = Number(id);
    await sql`UPDATE cars SET status = ${status} WHERE id = ${carId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

