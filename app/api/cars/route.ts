import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      brand, model, year, price, kilometers, color, 
      description, images, user_id, payment_method, 
      is_featured, featured_price, currency 
    } = body;

    let finalImageUrl = "";

    if (images && images.length > 0 && images.startsWith('data:image')) {
      const base64Data = images.split(',')[1];
      const mimeType = images.split(';')[0].split(':')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const extension = mimeType.split('/')[1] || 'jpg';
      
      const blobFilename = `car-${Date.now()}.${extension}`;
      const blobResult = await put(blobFilename, buffer, {
        access: 'public',
        contentType: mimeType
      });
      finalImageUrl = blobResult.url;
    } else if (images && images.length > 0) {
      finalImageUrl = images;
    }

    const result = await sql`
      INSERT INTO ads (
        title, price, description, image_url, status, 
        brand, model, year, color, mileage, extra_info
      )
      VALUES (
        ${brand + ' ' + model}, ${price || '0'}, ${description || ''}, ${finalImageUrl}, 'pending',
        ${brand || ''}, ${model || ''}, ${year ? Number(year) : null}, ${color || ''}, ${kilometers ? Number(kilometers) : null}, ${payment_method || ''}
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
    
    // تحديث حالة السيارة حقيقياً داخل قاعدة بيانات Neon المعتمدة بموقعك
    await sql`UPDATE ads SET status = ${status} WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating car status:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
