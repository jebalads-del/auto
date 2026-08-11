import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// إنشاء اتصال بقاعدة البيانات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const carId = formData.get('carId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد صور' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
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
      uploadedUrls.push(blob.url);
    }

    // تخزين الروابط كنص مفصول بفواصل (comma-separated)
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

    console.log('✅ تم رفع الصور:', uploadedUrls);

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });

  } catch (error: any) {
    console.error('❌ خطأ في رفع الصور:', error);
    return NextResponse.json(
      { error: error.message || 'فشل رفع الصور' },
      { status: 500 }
    );
  }
}
