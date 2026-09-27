import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ✅ دالة لإنشاء العميل (Runtime)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// ===== GET: جلب جميع الإعلانات (جديد!) =====
export async function GET() {
  try {
    console.log('📋 [GET CARS] جلب الإعلانات...');

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .in('status', ['approved', 'sold'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [GET CARS ERROR]:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [GET CARS] تم جلب ${data?.length || 0} إعلان`);

    return NextResponse.json({
      success: true,
      cars: data || []
    });

  } catch (error: any) {
    console.error('❌ [GET CARS ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ' },
      { status: 500 }
    );
  }
}

// ===== POST: إضافة إعلان جديد =====
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('📦 Received data:', body);

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

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

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
