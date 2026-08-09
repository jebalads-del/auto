import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

export const dynamic = 'force-dynamic';

const BLOB_TOKEN = process.env.CARS_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || "";

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
    let carIdFromForm: string | null = null;

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
      rawImages = formData.get('image') || formData.get('images');
      carIdFromForm = formData.get('carId') as string || null;
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
      carIdFromForm = body.carId || null;
    }

    let finalImageUrl = "";

    if (rawImages && typeof rawImages === 'object' && typeof rawImages.arrayBuffer === 'function') {
      const blobFilename = `car-${Date.now()}-${rawImages.name || 'photo.png'}`;
      const buffer = Buffer.from(await rawImages.arrayBuffer());
      const blobResult = await put(blobFilename, buffer, {
        access: 'public',
        token: BLOB_TOKEN,
        contentType: rawImages.type || 'image/png'
      });
      finalImageUrl = blobResult.url;
    } 
    else if (rawImages && typeof rawImages === 'string' && rawImages.startsWith('data:image')) {
      const commaIndex = rawImages.indexOf(',');
      if (commaIndex !== -1) {
        const base64Content = rawImages.substring(commaIndex + 1);
        const buffer = Buffer.from(base64Content, 'base64');
        const blobFilename = `car-${Date.now()}.jpg`;
        const blobResult = await put(blobFilename, buffer, { access: 'public', token: BLOB_TOKEN, contentType: 'image/jpeg' });
        finalImageUrl = blobResult.url;
      }
    } else if (typeof rawImages === 'string') {
      finalImageUrl = rawImages;
    }

    if (carIdFromForm && Number(carIdFromForm) > 0) {
      const targetId = Number(carIdFromForm);
      await sql`UPDATE cars SET images = ${finalImageUrl} WHERE id = ${targetId}`;
      return NextResponse.json({ success: true, id: targetId, carId: targetId });
    }

    const result = await sql`
      INSERT INTO cars (user_id, brand, model, year, color, kilometers, description, price, images, status, is_featured, payment_method)
      VALUES (${user_id ? Number(user_id) : null}, ${brand}, ${model}, ${year ? Number(year) : null}, ${color}, ${kilometers ? Number(kilometers) : null}, ${description}, ${price ? Number(price) : 0}, ${finalImageUrl}, 'pending', ${is_featured}, ${payment_method})
      RETURNING id
    `;

    // 🛡️ التعديل الجوهري القاطع: استخراج الـ ID المباشر والآمن تمامًا من مصفوفة الـ SQL لتخطي خطأ البناء
    let explicitId: number | null = null;
    if (Array.isArray(result) && result.length > 0) {
      explicitId = Number(result[0].id || null);
    } else {
      const fallbackRow: any = result;
      explicitId = fallbackRow && fallbackRow.id ? Number(fallbackRow.id) : null;
    }

    return NextResponse.json({ 
      success: true, 
      id: explicitId,
      carId: explicitId,
      data: { id: explicitId }
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
