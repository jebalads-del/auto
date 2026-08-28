import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// استخدام Service Role Key للوصول إلى Admin API
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [ADMIN USERS] جلب قائمة المستخدمين من Auth...');

    // استخدام Admin API لجلب المستخدمين
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('❌ [ADMIN USERS ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب المستخدمين: ' + error.message },
        { status: 500 }
      );
    }

    const users = data.users || [];

    // تنسيق البيانات
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
      { success: false, message: 'حدث خطأ أثناء معالجة البيانات' },
      { status: 500 }
    );
  }
}

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

    // منع حذف المدير الرئيسي (بالبريد الإلكتروني)
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
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
