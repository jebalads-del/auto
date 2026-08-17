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
    const formData = await request.formData();
    // ✅ تغيير من 'files' إلى 'images' لتطابق صفحة النشر
    const files = formData.getAll('images') as File[];
    const carId = formData.get('carId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'لم يتم إرسال أي صور' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const blob = await put(
          `cars/${carId || 'temp'}/${Date.now()}-${file.name}`,
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
        }
      }
    }

    // ✅ حفظ الروابط في قاعدة البيانات
    if (carId && uploadedUrls.length > 0) {
      const imagesString = uploadedUrls.join(',');
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE cars SET images = $1 WHERE id = $2',
          [imagesString, parseInt(carId)]
        );
      } finally {
        client.release();
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });

  } catch (error: any) {
    console.error('خطأ في رفع الصور:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'فشل رفع الصور' },
      { status: 500 }
    );
  }
}
