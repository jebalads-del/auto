import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// 1. جلب إعلانات السيارات لقسم الأدمن
export async function GET() {
  try {
    // التحقق من اسم الجدول الفعلي في قاعدة بيانات Neon
    const tableCheck = await sql`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cars') as table_exists
    `;
    const tableName = tableCheck[0]?.table_exists ? 'cars' : 'Cars';

    // تنفيذ استعلام جلب البيانات
    const query = `
      SELECT id, brand, model, year, price, kilometers, color, description, images, user_name, user_email, status, payment_method, created_at, currency
      FROM ${tableName}
      WHERE status IS NULL OR status != 'deleted'
      ORDER BY id DESC
    `;
    
    const cars = await sql.query(query);

    return NextResponse.json({ success: true, cars });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'فشل جلب السيارات: ' + error.message }, { status: 500 });
  }
}

// 2. استقبال عمليات الحذف، الموافقة والرفض المتوافقة مع واجهة لوحة التحكم
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // استقبال الـ carId والـ action المرسلة من الواجهة
    const { carId, action } = body; 

    if (!carId) {
      return NextResponse.json({ success: false, error: 'معرف السيارة غير موجود بالطلب' }, { status: 400 });
    }

    // التحقق من اسم الجدول الفعلي في قاعدة بيانات Neon
    const tableCheck = await sql`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cars') as table_exists
    `;
    const tableName = tableCheck[0]?.table_exists ? 'cars' : 'Cars';

    let targetStatus = 'pending';
    let responseMessage = '';

    // ترجمة الـ action المرسل من الواجهة إلى حالات تفهمها قاعدة البيانات
    if (action === 'approve') {
      targetStatus = 'approved';
      responseMessage = 'تمت الموافقة على إعلان السيارة ونشره بنجاح';
    } else if (action === 'reject') {
      targetStatus = 'rejected';
      responseMessage = 'تم رفض الإعلان بنجاح';
    } else if (action === 'delete') {
      targetStatus = 'deleted';
      responseMessage = 'تم حذف إعلان السيارة نهائياً من العرض';
    } else {
      return NextResponse.json({ success: false, error: 'الإجراء المطلوب غير مدعوم بالسيرفر' }, { status: 400 });
    }

    // تنفيذ التحديث الفعلي داخل Neon PostgreSQL
    const updateQuery = `UPDATE ${tableName} SET status = $1 WHERE id = $2 RETURNING id`;
    const result = await sql.query(updateQuery, [targetStatus, carId]);

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'إعلان السيارة غير موجود بقاعدة البيانات' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: responseMessage });
  } catch (error: any) {
    console.error('تفاصيل خطأ السيرفر:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'حدث خطأ غير معروف أثناء التحديث' },
      { status: 500 }
    );
  }
}
