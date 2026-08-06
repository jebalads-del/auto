import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // استقبال الحقول الحقيقية المتطابقة مع استمارة موقعك وعمود قاعدة البيانات
    const { 
      brand, model, year, price, kilometers, color, 
      description, images, user_id, payment_method, 
      is_featured
    } = body;

    let finalImageUrl = "";

    // معالجة صور الـ Base64 ورفعها لـ Vercel Blob الحية
    if (images && typeof images === 'string' && images.startsWith('data:image')) {
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
    } else if (images && typeof images === 'string') {
      finalImageUrl = images;
    }

    // صياغة رابط الصورة كمصفوفة نصوص ARRAY ليتوافق مع العمود رقم 10 في الداتابيز
    const imageArray = finalImageUrl ? [finalImageUrl] : [];

    // استعلام الحفظ المحدث والمطابق 100% لأعمدة Neon DB التي ظهرت في الصورة
    const result = await sql`
      INSERT INTO cars (
        user_id, brand, model, year, color, 
        kilometers, description, price, images, status, 
        is_featured, payment_method
      )
      VALUES (
        ${user_id ? Number(user_id) : null}, ${brand || ''}, ${model || ''}, ${year ? Number(year) : null}, ${color || ''},
        ${kilometers ? Number(kilometers) : null}, ${description || ''}, ${price ? Number(price) : 0}, ${imageArray}, 'pending',
        ${is_featured ? true : false}, ${payment_method || 'western'}
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
    
    // تحديث العمود رقم 11 (status) في جدول cars الفعلي
    await sql`UPDATE cars SET status = ${status} WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating car status:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
