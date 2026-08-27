import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// أ) دالة جلب السيارات بالكامل للعرض بالموقع
export async function GET() {
  try {
    const { data: cars, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, cars: cars || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ب) دالة إضافة إعلان سيارة جديد للمستخدمين
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // إدراج السيارة مباشرة في جدول سوبابيس حياً ومباشرة مع تعيين حالة الانتظار تلقائياً
    const { data, error } = await supabase
      .from('cars')
      .insert([
        {
          title: `${body.brand} ${body.model}`,
          price: parseFloat(body.price),
          year: parseInt(body.year) || null,
          image_url: body.imageUrl || body.image_url || '',
          status: 'قيد الانتظار', // الحالة الافتراضية للموافقة الإدارية لاحقاً
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم إضافة الإعلان بنجاح وهو قيد مراجعة الإدارة الآن', car: data?.[0] });
  } catch (error: any) {
    console.error('❌ [ADD CAR ERROR]:', error.message);
    return NextResponse.json({ success: false, message: 'خطأ أثناء حفظ الإعلان: ' + error.message }, { status: 500 });
  }
}
