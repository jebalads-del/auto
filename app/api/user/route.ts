import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    console.log(`🔍 [USER] جلب بيانات المستخدم: ${email}`);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, status, created_at')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error('❌ [USER ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب المستخدم' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });

  } catch (error: unknown) {
    console.error('❌ [USER ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
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

    console.log(`🗑️ [USER DELETE] حذف المستخدم: ${userId}`);

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('❌ [USER DELETE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في حذف المستخدم: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [USER DELETE] تم حذف المستخدم: ${userId}`);
    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [USER DELETE ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
