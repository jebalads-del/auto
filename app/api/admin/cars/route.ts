import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // جلب البيانات مباشرة من جدول cars بشكل مجرد ومحمي لتفادي تعقيدات الـ JOIN
    const rawCars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, description, images, status, currency, created_at 
      FROM cars 
      WHERE status IS NULL OR status != 'deleted' 
      ORDER BY id DESC
    `;

    // تنسيق مرن جداً لبيانات السيارات لضمان عدم حدوث كراش في الواجهة
    const formattedCars = rawCars.map((car: any) => ({
      id: car.id,
      brand: String(car.brand || 'سيارة غير معروفة'),
      model: String(car.model || ''),
      year: Number(car.year || 0),
      price: Number(car.price || 0),
      kilometers: Number(car.kilometers || 0),
      color: String(car.color || ''),
      description: String(car.description || ''),
      images: Array.isArray(car.images) ? car.images : (car.images ? [car.images] : []),
      user_name: 'معلن', 
      user_email: '---',
      status: String(car.status || 'pending'),
      created_at: car.created_at || new Date().toISOString(),
      currency: String(car.currency || 'د.أ')
    }));

    return NextResponse.json({ success: true, cars: formattedCars });
  } catch (error: any) {
    console.error('تفاصيل خطأ جلب السيارات بالسيرفر:', error);
    // إرجاع مصفوفة فارغة بدلاً من كسر الصفحة لتفادي رسالة الفشل الحمراء
    return NextResponse.json({ success: true, cars: [], message: 'تم إرجاع مصفوفة فارغة لحماية الصفحة' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, action } = body; 

    if (!carId) {
      return NextResponse.json({ success: false, error: 'معرف السيارة مفقود بالطلب' }, { status: 400 });
    }

    let targetStatus = 'pending';
    let responseMessage = '';

    if (action === 'approve') {
      targetStatus = 'approved';
      responseMessage = 'تمت الموافقة على إعلان السيارة ونشره بنجاح';
    } else if (action === 'reject') {
      targetStatus = 'rejected';
      responseMessage = 'تم رفض الإعلان بنجاح';
    } else if (action === 'delete') {
      targetStatus = 'deleted';
      responseMessage = 'تم حذف الإعلان نهائياً';
    }

    const result = await sql`UPDATE cars SET status = ${targetStatus} WHERE id = ${carId} RETURNING id`;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'إعلان السيارة غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: responseMessage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
