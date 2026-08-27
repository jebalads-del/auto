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

// تحديث سيارة (موافقة، تغيير الحالة)
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

    console.log(`🔄 [CAR UPDATE] تحديث السيارة: ${carId}`, body);

    const { data: car, error } = await supabase
      .from('cars')
      .update(body)
      .eq('id', carId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ [CAR UPDATE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في تحديث السيارة: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [CAR UPDATE] تم تحديث السيارة: ${carId}`);
    return NextResponse.json({ success: true, car });

  } catch (error: unknown) {
    console.error('❌ [CAR UPDATE ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}

// حذف سيارة
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
        { success: false, message: 'خطأ في حذف السيارة: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [CAR DELETE] تم حذف السيارة: ${carId}`);
    return NextResponse.json({
      success: true,
      message: 'تم حذف السيارة بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [CAR DELETE ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
