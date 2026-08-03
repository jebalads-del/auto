import { NextResponse } from 'next/server';
import pool from '@/app/api/db';

// 🔍 جلب الإعلانات التجارية للأدمن والموقع
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_id, position, status, price, duration_days, start_date, end_date, image_url FROM commercial_ads ORDER BY id DESC'
    );
    return NextResponse.json({ success: true, ads: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ❌ دالة حذف الإعلان التجاري الفعلي من جذور قاعدة البيانات بحقن رقمي سليم
export async function DELETE(request: Request) {
  try {
    const { url } = request;
    const urlObj = new URL(url);
    const idParam = urlObj.searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ success: false, message: 'معرف الإعلان مطلوب' }, { status: 400 });
    }

    // ⚡ تحويل المعرف البرمجي إلى رقم صحيح (Number Cast) لمنع فشل استعلام قاعدة البيانات
    const adId = parseInt(idParam, 10);
    if (isNaN(adId)) {
      return NextResponse.json({ success: false, message: 'معرف الإعلان غير صحيح' }, { status: 400 });
    }

    const [result]: any = await pool.query('DELETE FROM commercial_ads WHERE id = ?', [adId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'الإعلان غير موجود أو تم حذفه مسبقاً' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف الإعلان بنجاح من قاعدة البيانات' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ⚙️ دالة تحديث حالة الإعلان (مقبول / مرفوض) وتأكيد المزامنة مع الصفحة الرئيسية
export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'البيانات المطلوبة ناقصة' }, { status: 400 });
    }

    const adId = parseInt(id, 10);
    if (isNaN(adId)) {
      return NextResponse.json({ success: false, message: 'المعرف غير صحيح' }, { status: 400 });
    }

    await pool.query('UPDATE commercial_ads SET status = ? WHERE id = ?', [status.toLowerCase(), adId]);
    return NextResponse.json({ success: true, message: 'تم تحديث حالة الإعلان بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
