export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

// 1. جلب السيارات الحقيقية من جدول cars الفعلي
export async function GET() {
  try {
    const cars = await sql`SELECT * FROM cars ORDER BY id DESC`;
    return NextResponse.json(cars || []);
  } catch (error) {
    console.error("Neon GET Error:", error);
    return NextResponse.json([]);
  }
}

// 2. استقبال وحفظ إعلان السيارة مع تطابق حقول جدول cars تماماً
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let brand = '', model = '', year = '', color = '', price = '', description = '', status = 'pending';
    let kilometers = 0, currency = '$', image_url = '';
    
    let fallback_svg = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M18.92 11.01C18.72 10.42 18.16 10 17.5 10H6.5c-.66 0-1.22.42-1.42 1.01L3 17v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 12h10.29l1.04 3H5.81l1.04-3z"/></svg>';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      brand = formData.get('brand') as string || '';
      model = formData.get('model') as string || '';
      year = formData.get('year') as string || '';
      color = formData.get('color') as string || '';
      price = formData.get('price') as string || '';
      description = formData.get('notes') as string || formData.get('description') as string || '';
      status = formData.get('status') as string || 'pending';

      const imageFile = formData.get('images') as File;
      if (imageFile && imageFile.size > 0) {
        const blob = await put(`cars/${Date.now()}-${imageFile.name}`, imageFile, {
          access: 'public',
        });
        image_url = blob.url;
      } else {
        image_url = fallback_svg;
      }
    } else {
      const body = await request.json();
      brand = body.brand || '';
      model = body.model || '';
      year = body.year || '';
      color = body.color || '';
      price = body.price || '';
      description = body.description || '';
      status = body.status || 'pending';
      image_url = body.image_url || fallback_svg;
      kilometers = body.kilometers ? Number(body.kilometers) : 0;
      currency = body.currency || '$';
    }

    // الاستعلام النظيف والحاسم الموجه لجدول cars فقط لا غير وبأعمدته الدقيقة
    const result = await sql`
      INSERT INTO cars (brand, model, year, price, kilometers, color, description, currency, images, status)
      VALUES (
        ${brand}, 
        ${model}, 
        ${year ? Number(year) : null}, 
        ${price}, 
        ${kilometers}, 
        ${color}, 
        ${description}, 
        ${currency}, 
        ${image_url}, 
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

// 3. تحديث حالة السيارة (موافقة، رفض، مُباعة) داخل جدول cars
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

// 4. حذف السيارة نهائياً من جدول cars
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
