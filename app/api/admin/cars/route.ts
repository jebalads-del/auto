import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// دالة معالجة أزرار الأدمن (الموافقة أو الحذف)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, action } = body;

    if (!carId || !action) {
      return NextResponse.json({ success: false, message: 'البيانات المطلوبة ناقصة' }, { status: 400 });
    }

    let newStatus = 'قيد الانتظار';
    if (action === 'approve') newStatus = 'مقبول';
    if (action === 'sell') newStatus = 'مباع';

    // التحديث النصي المتوافق تماماً لـ UUID
    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', carId.toString());

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم تحديث حالة الإعلان بنجاح في قاعدة البيانات' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
