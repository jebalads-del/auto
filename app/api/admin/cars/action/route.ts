import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // جلب البيانات بالصيغة المطابقة تماماً لكود الواجهة الأمامية لديك
    const { carId, action } = await request.json();

    if (!carId || !action) {
      return NextResponse.json({ success: false, message: 'البيانات المطلوبة ناقصة' }, { status: 400 });
    }

    console.log(`⚙️ [ADMIN ACTION] إجراء ${action} على السيارة: ${carId}`);

    // تحديد الحالة الجديدة لجدول سوبابيس بناءً على نوع الزر المكبوس
    let newStatus = 'قيد الانتظار';
    if (action === 'approve') newStatus = 'مقبول';
    if (action === 'reject') newStatus = 'مرفوض';

    // تنفيذ التحديث المباشر والحركي حياً داخل جدول قاعدة البيانات
    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', carId);

    if (error) {
      console.error('❌ [SUPABASE UPDATE ERROR]:', error.message);
      return NextResponse.json({ success: false, message: 'خطأ في تحديث قاعدة البيانات: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'تمت الموافقة على الإعلان بنجاح وتفعيله حياً للمستخدمين' : 'تم رفض الإعلان بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN ACTION CRASH]:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ داخلي في الخادم' }, { status: 500 });
  }
}
