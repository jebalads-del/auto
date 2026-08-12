import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db'; // تم تصحيح مسار الداتابيز هنا ليصبح خطوتين فقط للخلف

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف السيارة مفقود' }, { status: 400 });
    }

    // استعلام جلب بيانات سيارة مفردة حية من Neon PostgreSQL
    const carResult = await sql`
      SELECT id, brand, model, year, price, kilometers, color, 
             description, images, status, created_at, currency 
      FROM cars 
      WHERE id = ${id}
    `;

    if (!carResult || carResult.length === 0) {
      return NextResponse.json({ success: false, message: 'الإعلان غير موجود' }, { status: 404 });
    }

    const car = carResult[0];

    // تنظيف وتفكيك حقل الصور الصارم ليخرج للمتصفح كروابط نظيفة ومستقرة دائماً
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
    // بناء كائن الرد النموذجي بحروف صغيرة متوافقة تماماً مع شاشات الموقع
    const sanitizedCar = {
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

    return NextResponse.json(
      { success: true, car: sanitizedCar },
      {
        headers: { 'Cache-Control': 'no-store, must-revalidate' }
      }
    );
  } catch (error) {
    console.error('خطأ في جلب تفاصيل الإعلان:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في السيرفر' }, { status: 500 });
  }
}
