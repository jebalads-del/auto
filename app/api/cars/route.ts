import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // جلب البيانات
    const body = await request.json();
    
    console.log('📦 Received data:', body);

    // التحقق من البيانات المطلوبة
    if (!body.brand || !body.model || !body.price) {
      return NextResponse.json(
        { success: false, message: 'الماركة، الموديل، والسعر مطلوبة' },
        { status: 400 }
      );
    }

    if (!body.user_id) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // إنشاء عميل Supabase
    const supabase = createRouteHandlerClient({ cookies });

    // إضافة الإعلان
    const { data, error } = await supabase
      .from('cars')
      .insert([{
        brand: body.brand,
        model: body.model,
        year: body.year || null,
        price: parseFloat(body.price),
        kilometers: body.kilometers ? parseFloat(body.kilometers) : null,
        color: body.color || null,
        description: body.description || null,
        images: body.images || [],
        user_id: body.user_id,
        currency: body.currency || 'KWD',
        status: body.status || 'pending',
        created_at: new Date().toISOString(),
      }])
      .select();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Car added successfully:', data);
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
