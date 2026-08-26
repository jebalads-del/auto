import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, action } = body;

    if (!carId || !action) {
      return NextResponse.json({ success: false, message: 'البيانات المطلوبة ناقصة' }, { status: 400 });
    }

    console.log(`⚙️ [ADMIN CAR ACTION] إجراء ${action} على السيارة: ${carId}`);

    // 1. تحديد الحالة الجديدة بناءً على كبس أزرار الأدمن
    let newStatus = 'قيد الانتظار';
    if (action === 'approve') newStatus = 'مقبول';
    if (action === 'reject') newStatus = 'مرفوض';

    // 2. تحديث جدول السيارات في سوبابيس حياً ومباشرة
    // تم استخدام CAST والتحويل النصي لضمان مطابقة الـ ID مع نوع البيانات في قاعدة بياناتك
    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', carId.toString()); // تحويل المعرف لنص لتجنب تعارض الأنواع أمنياً

    if (error) {
      console.error('❌ [SUPABASE ADMIN UPDATE ERROR]:', error.message);
      return NextResponse.json({ success: false, message: 'خطأ في تحديث قاعدة البيانات: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'تمت الموافقة على الإعلان بنجاح ونشره للمستخدمين حياً' : 'تم رفض الإعلان بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN CAR ACTION CRASH]:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ داخلي في السيرفر' }, { status: 500 });
  }
}
