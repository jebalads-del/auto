import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// دالة مشتركة لمعالجة التحديث ومنع أخطاء التضارب في صيغ الطلبات
async function handleUpdate(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, action } = body;

    if (!carId || !action) {
      return NextResponse.json({ success: false, message: 'البيانات ناقصة' }, { status: 400 });
    }

    console.log(`⚙️ [ADMIN CAR PROCESS] إجراء ${action} على السيارة: ${carId}`);

    let newStatus = 'قيد الانتظار';
    if (action === 'approve') newStatus = 'مقبول';
    if (action === 'sell') newStatus = 'مباع';

    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', carId.toString());

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم تحديث حالة الإعلان بنجاح في قاعدة البيانات' });
  } catch (error: any) {
    console.error('❌ [UPDATE ERROR]:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// استقبال الـ POST والـ PUT معاً لمنع خطأ اتصال السيرفر نهائياً
export async function POST(request: NextRequest) { return handleUpdate(request); }
export async function PUT(request: NextRequest) { return handleUpdate(request); }

// دالة حذف السيارة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'المعرف مطلوب' }, { status: 400 });

    const { error } = await supabase.from('cars').delete().eq('id', id.toString());
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم حذف الإعلان بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
