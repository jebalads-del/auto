import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    console.log(`⬆️ [USER UPGRADE] ترقية المستخدم: ${userId} إلى ${role || 'admin'}`);

    const { data: user, error } = await supabase
      .from('users')
      .update({ role: role || 'admin' })
      .eq('id', parseInt(userId))
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ [USER UPGRADE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في ترقية المستخدم' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user });

  } catch (error: unknown) {
    console.error('❌ [USER UPGRADE ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
