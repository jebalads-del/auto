import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

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

    if (rawImages && typeof rawImages === 'string' && rawImages.startsWith('data:image')) {
      const base64Parts = rawImages.split(',');
      const base64Header = base64Parts[0] || '';
      const base64Content = base64Parts[1] || '';
      
      const mimeMatch = base64Header.match(/data:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const extension = mimeType.split('/')[1] || 'jpg';
      
      const buffer = Buffer.from(base64Content, 'base64');
      const blobFilename = `car-${Date.now()}.${extension}`;
      
      const blobResult = await put(blobFilename, buffer, {
        access: 'public',
        contentType: mimeType
      });
      finalImageUrl = blobResult.url;
    } else if (rawImages && typeof rawImages !== 'string' && rawImages.size > 0) {
      const blobFilename = `car-${Date.now()}-${rawImages.name}`;
      const blobResult = await put(blobFilename, rawImages, {
        access: 'public',
        contentType: rawImages.type
      });
      finalImageUrl = blobResult.url;
    } else if (typeof rawImages === 'string') {
      finalImageUrl = rawImages;
    }

    const imageArray = finalImageUrl ? [finalImageUrl] : [];
    const result = await sql`
      INSERT INTO cars (
        user_id, brand, model, year, color, 
        kilometers, description, price, images, status, 
        is_featured, payment_method
      )
      VALUES (
        ${user_id ? Number(user_id) : null}, ${brand}, ${model}, ${year ? Number(year) : null}, ${color},
        ${kilometers ? Number(kilometers) : null}, ${description}, ${price ? Number(price) : 0}, ${imageArray}, 'pending',
        ${is_featured}, ${payment_method}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating car ad:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }
    
    const carId = Number(id);
    await sql`UPDATE cars SET status = ${status} WHERE id = ${carId}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating car status inside PUT route:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
