import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../db'; // تأكد من مسار ملف db حسب مجلدك (أو استبدله بـ import sql from '../db')

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // استقبال الـ payload الحقيقي المرسل من الصفحة الأمامية
    const { 
      brand, model, year, price, kilometers, color, 
      description, images, user_id, payment_method, 
      is_featured, featured_price, currency 
    } = body;

    let finalImageUrl = "";

    // إذا كانت هناك صورة مرفوعة بصيغة Base64، نقوم بفك تشفيرها ورفعها لـ Vercel Blob فوراً
    if (images && images.length > 0 && images[0].startsWith('data:image')) {
      const base64Data = images[0].split(',')[1];
      const mimeType = images[0].split(';')[0].split(':')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const extension = mimeType.split('/')[1] || 'jpg';
      
      const blobFilename = `car-${Date.now()}.${extension}`;
      const blobResult = await put(blobFilename, buffer, {
        access: 'public',
        contentType: mimeType
      });
      finalImageUrl = blobResult.url; // هذا هو الرابط الفعلي النظيف الذي سيُعرض في الموقع!
    } else if (images && images.length > 0) {
      finalImageUrl = images[0]; // إذا كان رابطاً جاهزاً
    }
    // إدخال البيانات المكتملة في جدول السيارات الفعلي
    // تأكد من تطابق أسماء الأعمدة في قاعدة بياناتك (أو عدلها لتطابق أعمدة جدول السيارات لديك)
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
