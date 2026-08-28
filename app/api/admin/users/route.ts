import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [ADMIN USERS] جلب قائمة المستخدمين من Auth...');

    // جلب المستخدمين من جدول المصادقة
    const { data: users, error } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data, created_at, last_sign_in_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [ADMIN USERS ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب المستخدمين: ' + error.message },
        { status: 500 }
      );
    }

    // تنسيق البيانات
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.raw_user_meta_data?.full_name || user.raw_user_meta_data?.name || user.email?.split('@')[0] || 'مستخدم',
      role: 'user',
      status: 'active',
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

    // منع حذف المدير الرئيسي
    if (id === 'abf1849b-1531-43e5-aae7-258e89902c49' || id === 'admin@sayarty.store') {
      return NextResponse.json(
        { success: false, message: 'لا يمكن حذف المدير الرئيسي' },
        { status: 403 }
      );
    }

    // حذف المستخدم من Auth
    const { error } = await supabase.auth.admin.deleteUser(id);

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
