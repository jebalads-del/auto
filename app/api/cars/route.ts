import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const dynamic = 'force-dynamic';

// ✅ جلب السيارات مع الصور (مع تحسين الأداء)
export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب إعلانات السيارات مع الصور (آخر 50)...');

    const client = await pool.connect();
    try {
      // ✅ إضافة LIMIT 50 لتسريع الاستعلام
      const result = await client.query(`
        SELECT
          id,
          brand,
          model,
          year,
          price,
          kilometers,
          color,
          description,
          images,
          status,
          is_featured,
          currency,
          created_at
        FROM cars
        WHERE status = 'approved' OR status = 'pending' OR status = 'active'
        ORDER BY id DESC
        LIMIT 50
      `);

      const cars = result.rows.map((car: any) => ({
        id: car.id,
        title: `${car.brand || ''} ${car.model || ''}`.trim() || 'سيارة جديدة',
        brand: car.brand || '',
        model: car.model || '',
        year: car.year || null,
        price: car.price || 0,
        kilometers: car.kilometers || 0,
        color: car.color || '',
        description: car.description || `سنة الصنع: ${car.year || ''} | الممشى: ${car.kilometers || ''} كم | اللون: ${car.color || 'غير محدد'}`,
        images: car.images || '',
        status: car.status || 'pending',
        is_featured: car.is_featured || false,
        currency: car.currency || 'KWD',
        created_at: car.created_at
      }));

      return NextResponse.json({ success: true, cars });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('❌ خطأ في جلب السيارات:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ حفظ الإعلان مع دعم الصور
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📩 استلام طلب نشر إعلان:', body);

    const {
      brand, model, year, price, kilometers,
      color, description, user_id, currency,
      images, status = 'pending', is_featured = false
    } = body;

    // التحقق من البيانات المطلوبة
    if (!brand || !model || !price) {
      return NextResponse.json(
        { success: false, error: 'الماركة، الموديل، والسعر مطلوبة' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // ✅ حفظ الإعلان مع الصور (إذا وجدت)
      const result = await client.query(
        `INSERT INTO cars
         (user_id, brand, model, year, price, kilometers, color, description, images, status, is_featured, currency, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
         RETURNING *`,
        [
          parseInt(user_id) || 1,
          brand.trim(),
          model.trim(),
          year || null,
          parseFloat(price) || 0,
          kilometers || null,
          color || 'رمادي',
          description || null,
          images || null,
          status || 'pending',
          is_featured || false,
          currency || 'KWD'
        ]
      );

      console.log('✅ تم حفظ الإعلان بنجاح:', result.rows[0]);

      return NextResponse.json({
        success: true,
        message: '🎉 تم إرسال وحفظ الإعلان بنجاح!',
        data: result.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('❌ خطأ في حفظ الإعلان:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
