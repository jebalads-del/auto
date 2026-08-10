import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

export const dynamic = 'force-dynamic';

const BLOB_TOKEN = process.env.CARS_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    let rawCars;
    if (statusParam === 'all') {
      rawCars = await sql`
        SELECT * FROM cars WHERE status != 'deleted' ORDER BY id DESC
      `;
    } else {
      rawCars = await sql`
        SELECT * FROM cars 
        WHERE status = 'approved' OR status = 'active' OR status = 'sold' 
        ORDER BY is_featured DESC, id DESC
      `;
    }

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
      is_featured: Boolean(car.is_featured === true || car.is_featured === 'true'),
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
    let payment_method = "", is_featured = false;
    let uploadedUrls: string[] = [];

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

      const allFiles = formData.getAll('images');
      for (const rawImages of allFiles) {
        if (rawImages && typeof rawImages === 'object' && typeof rawImages.arrayBuffer === 'function') {
          const blobFilename = `car-${Date.now()}-${rawImages.name || 'photo.png'}`;
          const buffer = Buffer.from(await rawImages.arrayBuffer());
          const blobResult = await put(blobFilename, buffer, {
            access: 'public',
            token: BLOB_TOKEN,
            contentType: rawImages.type || 'image/png'
          });
          if (blobResult.url) uploadedUrls.push(blobResult.url);
        }
      }
    }

    const finalImageUrlString = uploadedUrls.join(',');

    const result = await sql`
      INSERT INTO cars (user_id, brand, model, year, color, kilometers, description, price, images, status, is_featured, payment_method)
      VALUES (${user_id ? Number(user_id) : null}, ${brand}, ${model}, ${year ? Number(year) : null}, ${color}, ${kilometers ? Number(kilometers) : null}, ${description}, ${price ? Number(price) : 0}, ${finalImageUrlString}, 'pending', ${is_featured}, ${payment_method})
      RETURNING id
    `;

    // 🛡️ التعديل الجوهري الحاسم: استخراج المعرّف من مصفوفة الـ SQL بشكل سليم تماماً لتخطي خطأ البناء وتفعيل النشر
    let explicitId = null;
    if (Array.isArray(result) && result.length > 0) {
      explicitId = Number(result[0].id);
    } else {
      const fallback: any = result;
      explicitId = fallback && fallback.id ? Number(fallback.id) : null;
    }

    return NextResponse.json({ success: true, id: explicitId, carId: explicitId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, is_featured, images } = body;

    if (!id) return NextResponse.json({ success: false, error: "Missing car id" }, { status: 400 });
    const carId = Number(id);

    if (is_featured !== undefined) {
      const targetFeatured = is_featured === true || is_featured === 'true';
      await sql`UPDATE cars SET is_featured = ${targetFeatured} WHERE id = ${carId}`;
      return NextResponse.json({ success: true });
    }

    if (images) {
      await sql`UPDATE cars SET images = ${images} WHERE id = ${carId}`;
      return NextResponse.json({ success: true });
    }

    if (status) {
      await sql`UPDATE cars SET status = ${status} WHERE id = ${carId}`;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "No action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
