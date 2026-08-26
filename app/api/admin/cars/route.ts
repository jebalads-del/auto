import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db'; // التحديث للاستيراد الصحيح لـ Supabase

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 1. دالة معالجة تحديث حالة السيارة (الموافقة / تغيير الحالة)
export async function POST(request: NextRequest) {
  try {
    const { carId, action, status } = await request.json();

    if (!carId) {
      return NextResponse.json({ success: false, message: 'معرف السيارة مطلوب' }, { status: 400 });
    }

    console.log(`⚙️ [ADMIN CAR ACTION] إجراء ${action || 'تحديث'} على السيارة: ${carId}`);

    // تحديد الحالة الجديدة بناءً على الزر المضغوط
    let newStatus = status;
    if (action === 'approve') newStatus = 'مقبول';
    if (action === 'reject') newStatus = 'مرفوض';
    if (action === 'pending') newStatus = 'قيد الانتظار';

    // تحديث حالة السيارة حياً ومباشرة داخل جدول السيارات بسوبابيس
    const { error } = await supabase
      .from('cars') // تأكد من اسم جدول السيارات لديك (cars أو vehicles)
      .update({ status: newStatus })
      .eq('id', carId);

    if (error) {
      console.error('❌ [ADMIN CAR UPDATE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في تحديث حالة السيارة: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `تم تحديث حالة السيارة إلى (${newStatus}) بنجاح`
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN CAR UPDATE ERROR]:', error);
    return NextResponse.json({ success: false, message: 'فشل معالجة الطلب في السيرفر' }, { status: 500 });
  }
}

// 2. دالة حذف سيارة من لوحة الأدمن (احتياطية إذا كانت اللوحة تستدعي نفس المسار للحذف)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف السيارة مطلوب' }, { status: 400 });
    }

    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: 'خطأ أثناء حذف السيارة: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف الإعلان بنجاح' });
  } catch {
    return NextResponse.json({ success: false, message: 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
