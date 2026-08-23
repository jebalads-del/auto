import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🚗 [CARS] جلب قائمة السيارات...');

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const { data: cars, error, count } = await supabase
      .from('cars')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [CARS ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب السيارات: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [CARS] تم جلب ${cars?.length || 0} سيارة`);

    return NextResponse.json({
      success: true,
      cars: cars || [],
      total: count || 0
    });

  } catch (error: unknown) {
    console.error('❌ [CARS ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('➕ [CARS] إضافة سيارة جديدة...');

   const { data: car, error } = await supabase
  .from('cars')
  .insert([{
    ...body,
    user_id: 1,  // معرف المستخدم admin
    created_at: new Date().toISOString()
  }])
  .select()
  .maybeSingle(); 

    if (error) {
      console.error('❌ [CARS CREATE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في إضافة السيارة: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [CARS] تم إضافة السيارة: ${car?.id}`);
    return NextResponse.json({ success: true, car });

  } catch (error: unknown) {
    console.error('❌ [CARS CREATE ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
