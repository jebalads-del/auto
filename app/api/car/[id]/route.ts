import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: 'معرف السيارة غير متوفر' }, { status: 400 });
  }

  // دعم المتغيرات العادية والمزامنة تلقائياً من فِرسيل لمنع انقطاع الخادم
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  const cookieStore: Record<string, string> = {};
 // إنشاء مخزن كوكيز مبسط للـ API

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name) { return cookieStore[name]; },
      set(name, value, options) { cookieStore[name] = value; },
      remove(name, options) { delete cookieStore[name]; },
    },
  });

  try {
    console.log(`📡 الـ API يجلب بيانات السيارة صاحب المعرّف: ${id}`);

    // استعلام مباشر من جدول السيارات بـ Supabase
    const { data: car, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !car) {
      console.error('❌ خطأ قاعدة البيانات في الـ API:', error);
      return NextResponse.json({ error: 'لم يتم العثور على السيارة في قاعدة البيانات' }, { status: 404 });
    }

    // إرجاع بيانات السيارة بنجاح
    return NextResponse.json(car);

  } catch (err) {
    console.error('❌ خطأ غير متوقع في سيرفر الـ API:', err);
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم' }, { status: 500 });
  }
}
