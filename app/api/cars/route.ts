export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import sql from '../db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '36');
    const offset = (page - 1) * limit;

    // جلب البيانات حية من قاعدة بيانات Neon
    const rawCars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, 
             description, images, status, created_at, currency 
      FROM cars 
      WHERE status IN ('approved', 'sold') 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // معالجة وتوحيد أسماء الحقول لضمان وصولها للمتصفح بحروف صغيرة سليمة
    const cars = rawCars.map((car: any) => {
      const imagesRaw = car.images || car.IMAGES || '';
      let cleanedImagesStr = '';

      if (imagesRaw) {
        if (Array.isArray(imagesRaw) && imagesRaw.length > 0) {
          cleanedImagesStr = String(imagesRaw[0]).trim();
        } else if (typeof imagesRaw === 'string') {
          const rawStr = imagesRaw.trim();
          if (rawStr.includes(',')) {
            const splitArr = rawStr.split(',');
            if (splitArr.length > 0 && splitArr[0]) cleanedImagesStr = splitArr[0].trim();
          } else {
            cleanedImagesStr = rawStr;
          }
        }
      }

      return {
        id: car.id || car.ID,
        brand: car.brand || car.BRAND || '',
        model: car.model || car.MODEL || '',
        year: car.year || car.YEAR || 0,
        price: car.price || car.PRICE || 0,
        kilometers: car.kilometers || car.KILOMETERS || 0,
        color: car.color || car.COLOR || '',
        description: car.description || car.DESCRIPTION || '',
        status: car.status || car.STATUS || '',
        currency: car.currency || car.CURRENCY || 'KWD',
        created_at: car.created_at || car.CREATED_AT,
        images: cleanedImagesStr
      };
    });
    // جلب العدد الإجمالي للسيارات مع معالجة النوع البرمجي المصلحة
    const countResult = await sql`
      SELECT COUNT(*) as total FROM cars WHERE status IN ('approved', 'sold')
    `;
    const total = countResult && countResult[0] ? parseInt(countResult[0].total || '0') : 0;

    // إرجاع النتيجة الحية مع كسر الكاش لضمان معالجة فورية
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
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
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
