import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم غير صالح' },
        { status: 400 }
      );
    }

    console.log(`🔍 [USER ID] جلب بيانات المستخدم: ${userId}`);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, status, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ [USER ID ERROR]:', error);
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
    console.error('❌ [USER ID ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();
    const { role, status } = body;

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم غير صالح' },
        { status: 400 }
      );
    }

    console.log(`🔄 [USER UPDATE] تحديث المستخدم: ${userId}`);

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ [USER UPDATE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في تحديث المستخدم' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user });

  } catch (error: unknown) {
    console.error('❌ [USER UPDATE ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}

// حذف مستخدم
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);

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
