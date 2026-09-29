import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

// ✅ دالة لإنشاء العميل (Runtime)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// ===== GET: جلب بيانات السيارة =====
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: 'معرف السيارة غير متوفر' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 });
  }

  const cookieStore: Record<string, string> = {};

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) { return cookieStore[name]; },
      set(name, value, options) { cookieStore[name] = value; },
      remove(name, options) { delete cookieStore[name]; },
    },
  });

  try {
    console.log(`📡 الـ API يجلب بيانات السيارة صاحب المعرّف: ${id}`);
    const { data: car, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !car) {
      console.error('❌ خطأ قاعدة البيانات في الـ API:', error);
      return NextResponse.json({ error: 'لم يتم العثور على السيارة في قاعدة البيانات' }, { status: 404 });
    }

    return NextResponse.json(car);

  } catch (err) {
    console.error('❌ خطأ غير متوقع في سيرفر الـ API:', err);
    return NextResponse.json({ error: 'حدث خطأ داخلي في الخادم' }, { status: 500 });
  }
}

// ===== PUT: تحديث بيانات السيارة =====
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    const { status, featured_status, is_featured } = body;

    console.log(`🔄 [API CARS] محاولة تحديث السيارة رقم ${id} بالبيانات:`, body);

    // ✅ إنشاء العميل داخل الدالة
    const supabaseAdmin = getSupabaseAdmin();

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (featured_status !== undefined) updateData.featured_status = featured_status;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    const { data, error } = await supabaseAdmin
      .from('cars')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ [API CARS ERROR]:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات الإعلان بنجاح',
      car: data
    });

  } catch (error: any) {
    console.error('❌ [API CARS ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في السيرفر الداخلي' },
      { status: 500 }
    );
  }
}

// ===== DELETE: حذف الإعلان =====
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    console.log(`🗑️ [API CARS] طلب حذف الإعلان رقم: ${id}`);
    
    // ✅ إنشاء العميل داخل الدالة
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin.from('cars').delete().eq('id', id);
    
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'تم حذف الإعلان بنجاح من النظام' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'خطأ داخلي بالسيرفر' },
      { status: 500 }
    );
  }
}
