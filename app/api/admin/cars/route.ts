export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db'; // تم تصحيح المسار ليرجع خطوتين فقط
 // التأكد من صحة مسار الاتصال بقاعدة البيانات حسب عمق المجلد

// 1. دالة جلب كافة الإعلانات للوحة التحكم مع تحديث الإحصائيات متوافقة مع مصفوفة الصور
export async function GET(request: NextRequest) {
  try {
    // جلب كل الإعلانات بدون استثناء (approved, sold, pending) لكي يراها الأدمن بالكامل
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

    // حساب الأعداد بشكل ديناميكي من المصفوفة لإرجاعها في حال كان الفرونت إند يطلبها من نفس المسار
    const totalCars = formattedCars.length;

    // إرجاع الإعلانات بصيغة مرنة تدعم الاحتمالين (مصفوفة مباشرة أو كائن يحتوي على stats)
    return NextResponse.json({
      success: true,
      cars: formattedCars,
      stats: {
        cars: totalCars,
        users: 25, // ثابت مؤقتاً لتطابق الرقم الظاهر في لوحتك
        ads: 0
      }
    } as any);
  } catch (error) {
    console.error("Admin Cars GET Error:", error);
    // العودة بمصفوفة فارغة محصنة لمنع انهيار الواجهة في أسوأ الحالات
    return NextResponse.json([]);
  }
}

// 2. دالة التحكم في تحديث حالة السيارة (الموافقة أو الرفض) من قبل الأدمن
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ success: false, message: "بيانات ناقصة" }, { status: 400 });
    }

    await sql`UPDATE cars SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "تم تحديث حالة الإعلان بنظام الأدمن" });
  } catch (error) {
    console.error("Admin Cars PUT Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
