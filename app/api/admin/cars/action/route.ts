import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db'; // الاتصال الموحد المستقر المعتمد بموقعك

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 1. دالة معالجة تحديث حالة السيارة (موافقة ونشر / تحويل لمباع)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, action } = body;

    if (!carId || !action) {
      return NextResponse.json({ success: false, message: 'البيانات المطلوبة ناقصة' }, { status: 400 });
    }

    console.log(`⚙️ [ADMIN CAR ACTION] إجراء ${action} على السيارة: ${carId}`);

    // تحديد الحالة النصية المتوافقة تماماً مع شروط وعرض واجهتك الأمامية
    let newStatus = 'قيد الانتظار';
    if (action === 'approve') newStatus = 'مقبول';
    if (action === 'sell') newStatus = 'مباع';

    // تنفيذ التحديث المباشر بداخل جدول السيارات في سوبابيس
    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', carId.toString()); // الحماية بتحويل النوع لنص UUID المتوافق

    if (error) {
      console.error('❌ [SUPABASE ADMIN UPDATE ERROR]:', error.message);
      return NextResponse.json({ success: false, message: 'خطأ في تحديث قاعدة البيانات: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'تمت الموافقة على الإعلان بنجاح ونشره للمستخدمين حياً' : 'تم تحويل حالة السيارة إلى مباعة بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN CAR ACTION CRASH]:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ داخلي في السيرفر' }, { status: 500 });
  }
}

// 2. دالة حذف السيارة نهائياً للأدمن المربوطة بزر الحذف في اللوحة المحدثة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // جلب الـ id الممرر عبر الرابط تلقائياً

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف السيارة مطلوب للحذف' }, { status: 400 });
    }

    console.log(`🗑️ [ADMIN CAR DELETE] جاري حذف السيارة نهائياً ذو المعرف: ${id}`);

    // إتمام عملية الحذف من جدول السيارات في سوبابيس
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id.toString());

    if (error) {
      console.error('❌ [SUPABASE ADMIN DELETE ERROR]:', error.message);
      return NextResponse.json({ success: false, message: 'خطأ أثناء حذف السيارة: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإعلان نهائياً من قاعدة البيانات بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN CAR DELETE CRASH]:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ غير متوقع في خادم الموقع' }, { status: 500 });
  }
}
