import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const dynamic = 'force-dynamic';

// 1. دالة جلب السيارات مع دمج معلومات المالك (JOIN)
export async function GET() {
  try {
    // استعلام ذكي يدمج جدول السيارات (cars) مع جدول المستخدمين (users) بناءً على user_id
    // للحصول على اسم المعلن وإيميله الفعلي من قاعدة البيانات
    const query = `
      SELECT 
        c.id, 
        c.brand, 
        c.model, 
        c.year, 
        c.price, 
        c.kilometers, 
        c.color, 
        c.description, 
        c.images, 
        c.status, 
        c.currency, 
        c.created_at,
        u.name as user_name, 
        u.email as user_email
      FROM cars c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.status IS NULL OR c.status != 'deleted'
      ORDER BY c.id DESC
    `;
    
    const rawCars = await sql(query);

    // تنسيق مخرجات البيانات لضمان عدم حدوث كراش في واجهة الأدمن
    const formattedCars = rawCars.map((car: any) => ({
      id: car.id,
      brand: String(car.brand || 'غير معروف'),
      model: String(car.model || ''),
      year: Number(car.year || 0),
      price: Number(car.price || 0),
      kilometers: Number(car.kilometers || 0),
      color: String(car.color || ''),
      description: String(car.description || ''),
      // معالجة صيغة الصور سواء كانت مصفوفة أو نص عادي
      images: Array.isArray(car.images) ? car.images : (car.images ? [car.images] : []),
      user_name: String(car.user_name || 'مستخدم غير معروف'),
      user_email: String(car.user_email || 'لا يوجد بريد'),
      status: String(car.status || 'pending'),
      created_at: car.created_at || new Date().toISOString(),
      currency: String(car.currency || 'د.أ')
    }));

    return NextResponse.json({ success: true, cars: formattedCars });
  } catch (error: any) {
    console.error('خطأ في استعلام SQL للسيارات:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'فشل في جلب الإعلانات من قاعدة البيانات', 
      error: error.message 
    });
  }
}

// 2. دالة استقبال عمليات الحذف، الموافقة والرفض من الواجهة وتحديث Neon
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
    } else {
      return NextResponse.json({ success: false, error: 'الإجراء المطلوب غير مدعوم بالسيرفر' }, { status: 400 });
    }

    // التحديث المباشر في جدول cars بناءً على الحقول الصحيحة
    const updateQuery = `UPDATE cars SET status = $1 WHERE id = $2 RETURNING id`;
    const result = await sql(updateQuery, [targetStatus, carId]);

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'إعلان السيارة غير موجود في النظام' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: responseMessage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'حدث خطأ في السيرفر' }, { status: 500 });
  }
}
