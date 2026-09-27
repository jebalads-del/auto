import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// ===== GET: جلب قائمة المستخدمين =====
export async function GET(request: NextRequest) {
  try {
    console.log('📋 [ADMIN USERS] جلب قائمة المستخدمين من Auth...');

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('❌ [ADMIN USERS ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب المستخدمين: ' + error.message },
        { status: 500 }
      );
    }

    const users = data.users || [];

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'مستخدم',
      role: 'user',
      status: user.confirmed_at ? 'active' : 'pending',
      created_at: user.created_at
    }));

    console.log(`✅ [ADMIN USERS] تم جلب ${formattedUsers.length} مستخدم`);

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN USERS ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'حدث خطأ أثناء معالجة البيانات' },
      { status: 500 }
    );
  }
}

// ===== DELETE: حذف مستخدم =====
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    console.log(`🗑️ [ADMIN USERS] محاولة حذف المستخدم: ${id}`);

    const supabaseAdmin = getSupabaseAdmin();

    // منع حذف المدير الرئيسي
    const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(id);
    if (adminUser?.user?.email === 'admin@sayarty.store') {
      return NextResponse.json(
        { success: false, message: 'لا يمكن حذف المدير الرئيسي' },
        { status: 403 }
      );
    }

    // حذف المستخدم من Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      console.error('❌ [ADMIN USERS DELETE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في حذف المستخدم: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [ADMIN USERS] تم حذف المستخدم: ${id}`);
    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN USERS DELETE ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
