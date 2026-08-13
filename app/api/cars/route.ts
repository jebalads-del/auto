export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

// دالة مساعدة للتأكد من تحديث وهيكلة جدول cars بشكل صحيح
async function ensureCarsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        brand TEXT,
        model TEXT,
        year INTEGER,
        color TEXT,
        price NUMERIC,
        kilometers NUMERIC DEFAULT 0,
        description TEXT,
        currency TEXT DEFAULT '$',
        images TEXT,
        status TEXT DEFAULT 'pending'
      )
    `;
    await sql`ALTER TABLE cars ADD COLUMN IF NOT EXISTS title TEXT`;
    await sql`ALTER TABLE cars ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
  } catch (e) {
    console.error("Error ensuring table columns:", e);
  }
}

// 1. جلب السيارات
export async function GET() {
  try {
    await ensureCarsTable();
    const cars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, 
             description, images, status, currency 
      FROM cars 
      WHERE status IN ('approved', 'sold', 'pending') 
      ORDER BY id DESC
    `;
    
    const formattedCars = cars.map(car => {
      let parsedImages = [];
      try {
        if (typeof car.images === 'string') {
          if (car.images.trim().startsWith('[')) {
            parsedImages = JSON.parse(car.images);
          } else {
            parsedImages = [car.images];
          }
        } else if (Array.isArray(car.images)) {
          parsedImages = car.images;
        } else {
          parsedImages = [car.images];
        }
      } catch (e) {
        parsedImages = car.images ? [car.images] : [];
      }
      return { ...car, images: parsedImages };
    });

    return NextResponse.json(formattedCars || []);
  } catch (error) {
    console.error("Neon GET Error:", error);
    return NextResponse.json([]);
  }
}

// 2. استقبال وحفظ إعلان السيارة مع دعم رفع صور متعددة
export async function POST(request: NextRequest) {
  try {
    await ensureCarsTable();
    const contentType = request.headers.get('content-type') || '';
    let brand = '', model = '', year = '', color = '', price = '0', notes = '', status = 'approved';
    let uploadedImagesUrls: string[] = [];

    let fallback_svg = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M18.92 11.01C18.72 10.42 18.16 10 17.5 10H6.5c-.66 0-1.22.42-1.42 1.01L3 17v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 12h10.29l1.04 3H5.81l1.04-3z"/></svg>';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      brand = formData.get('brand') as string || '';
      model = formData.get('model') as string || '';
      year = formData.get('year') as string || '';
      color = formData.get('color') as string || '';
      price = formData.get('price') as string || '0';
      notes = formData.get('notes') as string || formData.get('description') as string || '';
      status = formData.get('status') as string || 'approved'; 

      // جلب جميع الملفات المرفوعة تحت أي مسمى حقل محتمل لضمان الدعم الكامل
      const imageFiles = formData.getAll('images').concat(formData.getAll('image')).concat(formData.getAll('file')) as File[];
      
      // معالجة ورفع كل الصور المحددة في لوحة التحكم حلقة تكرارية (Loop)
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          const blob = await put(`cars/${Date.now()}-${file.name}`, file, {
            access: 'public',
            token: process.env.CARS_BLOB_READ_WRITE_TOKEN,
            storeId: process.env.CARS_BLOB_STORE_ID, // ✅ تمت إضافة storeId
          });
          uploadedImagesUrls.push(blob.url);
        }
      }
    } else {
      const body = await request.json();
      brand = body.brand || '';
      model = body.model || '';
      year = body.year || '';
      color = body.color || '';
      price = body.price || '0';
      notes = body.description || body.notes || '';
      status = body.status || 'approved';
      if (body.image_url) uploadedImagesUrls.push(body.image_url);
    }

    // إذا لم يتم رفع أي صورة، نضع الصورة الاحتياطية
    if (uploadedImagesUrls.length === 0) {
      uploadedImagesUrls.push(fallback_svg);
    }

    const title = `${brand} ${model} ${year}`.trim();
    const imagesArrayJson = JSON.stringify(uploadedImagesUrls);

    // حفظ البيانات في Neon
    const result = await sql`
      INSERT INTO cars (title, brand, model, year, color, price, kilometers, description, currency, images, status)
      VALUES (
        ${title},
        ${brand},
        ${model},
        ${year ? Number(year) : null},
        ${color},
        ${Number(price)},
        0,
        ${notes},
        '$',
        ${imagesArrayJson},
        ${status}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Neon POST Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// 3. تحديث الحالة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    await sql`UPDATE cars SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// 4. الحذف
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false });
    await sql`DELETE FROM cars WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
