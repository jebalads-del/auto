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

    console.log(`🔍 [CAR ID] جلب بيانات السيارة: ${carId}`);

    const { data: car, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .maybeSingle();

    if (error) {
      console.error('❌ [CAR ID ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب السيارة' },
        { status: 500 }
      );
    }

    if (!car) {
      return NextResponse.json(
        { success: false, message: 'السيارة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, car });

  } catch (error: unknown) {
    console.error('❌ [CAR ID ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const carId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(carId)) {
      return NextResponse.json(
        { success: false, message: 'معرف السيارة غير صالح' },
        { status: 400 }
      );
    }

    console.log(`🔄 [CAR UPDATE] تحديث السيارة: ${carId}`);

    const { data: car, error } = await supabase
      .from('cars')
      .update(body)
      .eq('id', carId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ [CAR UPDATE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في تحديث السيارة' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, car });

  } catch (error: unknown) {
    console.error('❌ [CAR UPDATE ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    console.log(`🗑️ [CAR DELETE] حذف السيارة: ${carId}`);

    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId);

    if (error) {
      console.error('❌ [CAR DELETE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في حذف السيارة' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'تم حذف السيارة بنجاح' });

  } catch (error: unknown) {
    console.error('❌ [CAR DELETE ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
