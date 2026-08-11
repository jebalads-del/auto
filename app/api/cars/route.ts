import { NextRequest, NextResponse } from 'next/server';
import sql from '../db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '36');
    const offset = (page - 1) * limit;

    // ✅ جلب السيارات المقبولة والمباعة معاً مع Pagination
    const rawCars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, 
             description, images, status, created_at, currency 
      FROM cars 
      WHERE status IN ('approved', 'sold') 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // معالجة البيانات وتنظيف حقل الصور بشكل صارم لضمان استخراج روابط Vercel Blob السليمة
    const cars = rawCars.map((car: any) => {
      let cleanedImages: string[] = [];

      if (car.images) {
        if (Array.isArray(car.images)) {
          cleanedImages = car.images.map((img: any) => typeof img === 'string' ? img.trim() : '').filter(Boolean);
        } else if (typeof car.images === 'string') {
          let str = car.images.trim();
          
          // إذا كانت مخزنة بتنسيق مصفوفة PostgreSQL التقليدية مثل {url1,url2}
          if (str.startsWith('{') && str.endsWith('}')) {
            str = str.substring(1, str.length - 1);
            cleanedImages = str.split(',').map((img: any) => img.replace(/["]/g, '').trim()).filter(Boolean);
          } 
          // إذا كانت مخزنة بتنسيق JSON String مثل ["url1"]
          else if (str.startsWith('[') && str.endsWith(']')) {
            try {
              const parsed = JSON.parse(str);
              if (Array.isArray(parsed)) {
                cleanedImages = parsed.map((img: any) => typeof img === 'string' ? img.trim() : '').filter(Boolean);
              }
            } catch (e) {
              cleanedImages = [str];
            }
          } else {
            cleanedImages = [str];
          }
        }
      }

      return {
        ...car,
        images: cleanedImages.length > 0 ? cleanedImages : ''
      };
    });
    // ✅ جلب العدد الإجمالي للسيارات المقبولة والمباعة
    const countResult = await sql`
      SELECT COUNT(*) as total FROM cars WHERE status IN ('approved', 'sold')
    `;
    const total = parseInt(countResult[0].total);

    // ✅ إرجاع النتيجة مع تعطيل الكاش لضمان التحديث اللحظي للصور
    return NextResponse.json(
      {
        success: true,
        cars,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الإعلانات' },
      { status: 500 }
    );
  }
}
