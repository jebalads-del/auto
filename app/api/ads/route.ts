export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

export async function GET() {
  try {
    const ads = await sql`SELECT * FROM ads ORDER BY id DESC`;
    return NextResponse.json(ads || []);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let brand = '', model = '', year = '', color = '', price = '', notes = '', status = 'pending';
    let title = '', description = '';
    
    let image_url = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="%2394a3b8"><path d="M18.92 11.01C18.72 10.42 18.16 10 17.5 10H6.5c-.66 0-1.22.42-1.42 1.01L3 17v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 12h10.29l1.04 3H5.81l1.04-3z"/></svg>';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      brand = formData.get('brand') as string || '';
      model = formData.get('model') as string || '';
      year = formData.get('year') as string || '';
      color = formData.get('color') as string || '';
      price = formData.get('price') as string || '';
      notes = formData.get('notes') as string || '';
      status = formData.get('status') as string || 'pending';
      
      title = `${brand} ${model} ${year}`.trim();
      description = notes;

      const imageFile = formData.get('images') as File;
      if (imageFile && imageFile.size > 0) {
        const blob = await put(`cars/${Date.now()}-${imageFile.name}`, imageFile, {
          access: 'public',
        });
        image_url = blob.url;
      }
    } else {
      const body = await request.json();
      title = body.title || '';
      price = body.price || '';
      description = body.description || '';
      image_url = body.image_url || image_url;
      status = body.status || 'pending';
      brand = body.brand || '';
      model = body.model || '';
      year = body.year || '';
      color = body.color || '';
    }

    const result = await sql`
      INSERT INTO ads (
        title, price, description, image_url, status,
        brand, model, year, color, mileage, extra_info
      )
      VALUES (
        ${title}, ${price}, ${description || ''}, ${image_url}, ${status},
        ${brand || ''}, ${model || ''}, ${year ? Number(year) : null}, ${color || ''}, 0, ''
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    await sql`UPDATE ads SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false });
    await sql`DELETE FROM ads WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
