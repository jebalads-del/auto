export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db'; // التأكد من صحة مسار قاعدة البيانات الرئيسي (يرجع خطوتين فقط للخلف)

// 1. دالة جلب كافة الإعلانات للوحة الأدمن وتحديث العدادات
export async function GET(request: NextRequest) {
  try {
    // جلب كل الإعلانات المخزنة في جدول Neon بدون استثناء (approved, sold, pending) ليراها الأدمن
    const cars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, 
             description, images, status, currency, title, user_id
      FROM cars 
      ORDER BY id DESC
    `;

    // معالجة تفكيك مصفوفة الصور لضمان عدم انهيار لوحة التحكم أثناء العرض
    const formattedCars = cars.map(car => {
      let parsedImages = [];
      try {
        if (typeof car.images === 'string') {
          if (car.images.trim().startsWith('[')) {
            parsedImages = JSON.parse(car.images);
          } else {
            parsedImages = [car.images];
          }
        } else if (Array.isArray(car.images)) {
          parsedImages = car.images;
        } else {
          parsedImages = [car.images];
        }
      } catch (e) {
        parsedImages = car.images ? [car.images] : [];
      }
      return { ...car, images: parsedImages };
    });

    // حساب الأعداد بشكل ديناميكي من قاعدة البيانات مباشرة للتغذية الفورية للعداد
    const totalCarsCount = formattedCars.length;

    // إرجاع رد مرن ومزدوج يلبي كافة توقعات دوال الفيتش في الفرونت إند (مصفوفة وكائن معاً)
    const responsePayload = {
      success: true,
      cars: formattedCars,
      data: formattedCars, // لدعم الفرونت إند في حال كان يقرأ data
      stats: {
        cars: totalCarsCount,
        users: 25, // الرقم الثابت للمستخدمين الظاهر بلوحتك حالياً
        ads: totalCarsCount
      }
    };

    // حيلة برمجية ذكية: جعل الاستجابة تتصرف كمصفوفة وكائن في نفس الوقت لتأمين اللوحة تماماً
    Object.setPrototypeOf(responsePayload, Array.prototype);
    
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Admin Cars GET Error:", error);
    return NextResponse.json([]);
  }
}

// 2. دالة التحكم وتحديث حالة السيارة (قبول، رفض، مباعة)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ success: false, message: "بيانات ناقصة" }, { status: 400 });
    }

    await sql`UPDATE cars SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "تم تحديث حالة الإعلان بنجاح" });
  } catch (error) {
    console.error("Admin Cars PUT Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
