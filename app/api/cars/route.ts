import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db'; // استخدام عميل سوبابيس الموحد

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 1. دالة جلب قائمة السيارات بالكامل
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('id');

    // إذا كان الطلب يبحث عن سيارة محددة بالـ id
    if (carId) {
      const { data: car, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId.toString())
        .single();

      if (error || !car) {
        return NextResponse.json({ success: false, message: 'الإعلان غير موجود' }, { status: 404 });
      }
      return NextResponse.json({ success: true, car });
    }

    // جلب كافة السيارات للموقع مرتبة من الأحدث للأقدم
    const { data: cars, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, cars: cars || [] });

  } catch (error: any) {
    console.error('❌ [GET CARS ERROR]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. دالة إضافة إعلان سيارة جديد (متوافق مع حقول رفع الصور وسوبابيس)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brand, model, year, price, kilometers, carCondition, status, description, images, userEmail, userName, userPhone } = body;

    const { data, error } = await supabase
      .from('cars')
      .insert([
        {
          brand,
          model,
          year: parseInt(year) || null,
          price: parseFloat(price) || 0,
          kilometers: parseInt(kilometers) || 0,
          condition: carCondition,
          status: status || 'قيد الانتظار',
          description,
          images: images || [], // مصفوفة روابط الصور المرفوعة سحابياً
          user_email: userEmail,
          user_name: userName,
          user_phone: userPhone
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم نشر إعلانك بنجاح وهو قيد مراجعة الإدارة الآن', car: data?.[0] });

  } catch (error: any) {
    console.error('❌ [POST CAR ERROR]:', error);
    return NextResponse.json({ success: false, message: 'خطأ في حفظ الإعلان: ' + error.message }, { status: 500 });
  }
}

// 3. دالة معالجة الأزرار الحركية وتحديث الحالات (تغيير الحالة، الموافقة، التحويل لمباع)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, action, status } = body;

    if (!carId) {
      return NextResponse.json({ success: false, message: 'معرف السيارة مطلوب للتحديث' }, { status: 400 });
    }

    let newStatus = status;
    if (action === 'approve') newStatus = 'مقبول';
    if (action === 'sell' || action === 'sold') newStatus = 'مباع';
    if (!newStatus) newStatus = 'مقبول';

    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', carId.toString());

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم تحديث حالة السيارة بنجاح حياً' });

  } catch (error: any) {
    console.error('❌ [PUT CAR ERROR]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 4. دالة حذف السيارة نهائياً للأدمن والمستخدمين
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'المعرف مطلوب للحذف' }, { status: 400 });
    }

    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id.toString());

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم حذف الإعلان بنجاح نهائياً' });

  } catch (error: any) {
    console.error('❌ [DELETE CAR ERROR]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
