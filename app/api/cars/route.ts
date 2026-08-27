import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// معالجة تغيير الحالة (موافقة، رفض، مباع)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, id, action, status } = body;
    const targetId = carId || id;

    if (!targetId) {
      return NextResponse.json({ success: false, message: 'معرف السيارة مطلوب' }, { status: 400 });
    }

    let newStatus = status;
    if (action === 'approve' || action === 'activate') newStatus = 'مقبول';
    if (action === 'sell' || action === 'sold') newStatus = 'مباع';
    if (action === 'reject') newStatus = 'مرفوض';
    if (!newStatus) newStatus = 'مقبول';

    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', targetId.toString());

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم تحديث حالة الإعلان بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// معالجة حذف السيارة
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
