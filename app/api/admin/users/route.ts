import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [ADMIN USERS] جلب قائمة المستخدمين...');

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [ADMIN USERS ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب المستخدمين: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [ADMIN USERS] تم جلب ${users?.length || 0} مستخدم`);

    return NextResponse.json({
      success: true,
      users: users || []
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN USERS ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// حذف مستخدم
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

    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم غير صالح' },
        { status: 400 }
      );
    }

    // منع حذف المدير الرئيسي
    if (userId === 1) {
      return NextResponse.json(
        { success: false, message: 'لا يمكن حذف المدير الرئيسي' },
        { status: 403 }
      );
    }

    console.log(`🗑️ [ADMIN USERS] حذف المستخدم: ${userId}`);

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('❌ [ADMIN USERS DELETE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في حذف المستخدم: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [ADMIN USERS] تم حذف المستخدم: ${userId}`);
    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN USERS DELETE ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
