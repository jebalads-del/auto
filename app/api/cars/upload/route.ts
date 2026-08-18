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
    console.log('📸 [UPLOAD] بدء عملية رفع الصور...');
    
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const carId = formData.get('carId') as string;

    console.log(`📸 [UPLOAD] عدد الملفات: ${files.length}, carId: ${carId}`);

    if (!files || files.length === 0) {
      console.log('❌ [UPLOAD] لا توجد ملفات');
      return NextResponse.json(
        { success: false, message: 'لم يتم إرسال أي صور' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        console.log(`📸 [UPLOAD] رفع ملف: ${file.name}, الحجم: ${file.size} bytes`);
        
        const blob = await put(
          `cars/${carId}/${Date.now()}-${file.name}`,
          file,
          {
            access: 'public',
            token: process.env.CARS_BLOB_READ_WRITE_TOKEN,
            storeId: process.env.CARS_BLOB_STORE_ID,
            addRandomSuffix: true,
          }
        );
        if (blob && blob.url) {
          uploadedUrls.push(blob.url);
          console.log(`✅ [UPLOAD] تم رفع الملف: ${blob.url}`);
        }
      }
    }

    if (uploadedUrls.length === 0) {
      console.log('❌ [UPLOAD] فشل رفع جميع الملفات');
      return NextResponse.json(
        { success: false, message: 'فشل رفع الصور إلى التخزين' },
        { status: 500 }
      );
    }

    // ✅ حفظ الروابط في قاعدة البيانات
    if (carId) {
      const imagesString = uploadedUrls.join(',');
      console.log(`📸 [UPLOAD] حفظ الروابط في قاعدة البيانات: ${imagesString}`);
      
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE cars SET images = $1 WHERE id = $2',
          [imagesString, parseInt(carId)]
        );
        console.log(`✅ [UPLOAD] تم تحديث السيارة ${carId} بالصور`);
      } finally {
        client.release();
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });

  } catch (error: any) {
    console.error('❌ [UPLOAD] خطأ:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'فشل رفع الصور' },
      { status: 500 }
    );
  }
}
