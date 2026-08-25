import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const carId = parseInt(params.id);

    if (isNaN(carId)) {
      return NextResponse.json(
        { success: false, message: 'معرف السيارة غير صالح' },
        { status: 400 }
      );
    }

    console.log(`🔍 [CAR DETAIL] جلب بيانات السيارة: ${carId}`);

    const { data: car, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .maybeSingle();

    if (error) {
      console.error('❌ [CAR DETAIL ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب السيارة' },
        { status: 500 }
      );
    }

    if (!car) {
      console.log(`❌ [CAR DETAIL] السيارة ${carId} غير موجودة`);
      return NextResponse.json(
        { success: false, message: 'السيارة غير موجودة' },
        { status: 404 }
      );
    }

    console.log(`✅ [CAR DETAIL] تم جلب السيارة: ${carId}`);
    return NextResponse.json({ success: true, car });

  } catch (error: unknown) {
    console.error('❌ [CAR DETAIL ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
