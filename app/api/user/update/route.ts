import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, role, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    console.log(`🔄 [USER UPDATE] تحديث المستخدم: ${id}`);

    const updateData: any = {};
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', parseInt(id))
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
