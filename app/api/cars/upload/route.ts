import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 [UPLOAD] بدء عملية رفع الصور المصححة...');
    
    const formData = await request.formData();
    
    // الحل السحري: قراءة الملفات سواء أرسلتها الواجهة باسم 'file' أو 'images'
    const filesFromImages = formData.getAll('images') as File[];
    const filesFromFile = formData.getAll('file') as File[];
    const files = filesFromFile.length > 0 ? filesFromFile : filesFromImages;
    
    const carId = formData.get('carId') as string;

    console.log(`📸 [UPLOAD] عدد الملفات المكتشفة: ${files.length}, carId: ${carId}`);

    if (!files || files.length === 0 || !files[0] || files[0].size === 0) {
      console.log('❌ [UPLOAD] لا توجد ملفات صالحة للرفع');
      return NextResponse.json({ success: false, message: 'لم يتم إرسال أي صور صالحة' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.CARS_BLOB_READ_WRITE_TOKEN || process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;

    for (const file of files) {
      if (file && file.size > 0) {
        console.log(`📸 [UPLOAD] جاري رفع ملف الواجهة: ${file.name}`);
        const blob = await put(
          `cars/${carId}/${Date.now()}-${file.name}`,
          file,
          {
            access: 'public',
            token: blobToken,
            addRandomSuffix: true,
          }
        );
        if (blob && blob.url) {
          uploadedUrls.push(blob.url);
          console.log(`✅ [UPLOAD] تم الرفع بنجاح: ${blob.url}`);
        }
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ success: false, message: 'فشل رفع الصور إلى التخزين' }, { status: 500 });
    }

    const firstImageUrl = uploadedUrls[0];
    const imagesString = uploadedUrls.join(',');

    // ✅ تحديث قاعدة البيانات بكافة الصيغ لضمان التوافق المطلق مع الواجهة القديمة والمطورة
    if (carId) {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE cars 
           SET images = $1::text[], 
               image_url = $2,
               image = $3
           WHERE id = $4`,
          [uploadedUrls, firstImageUrl, imagesString, parseInt(carId, 10)]
        );
        console.log(`✅ [UPLOAD] تم حقن الروابط بنجاح في قاعدة البيانات للسيارة رقم: ${carId}`);
      } finally {
        client.release();
      }
    }

    // إرجاع الاستجابة بكافة الصيغ المتوقعة في السطر 50 للواجهة (url و image_url و urls)
    return NextResponse.json({
      success: true,
      url: firstImageUrl,
      image_url: firstImageUrl,
      urls: uploadedUrls,
    });

  } catch (error: any) {
    console.error('❌ [UPLOAD ERROR]:', error);
    return NextResponse.json({ success: false, message: error.message || 'فشل رفع الصور' }, { status: 500 });
  }
}
