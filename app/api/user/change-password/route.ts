import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, oldPassword, newPassword } = body;

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    console.log(`🔑 [CHANGE PASSWORD] تغيير كلمة المرور للمستخدم: ${userId}`);

    // التحقق من كلمة المرور القديمة
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', parseInt(userId))
      .maybeSingle();

    if (fetchError || !user) {
      console.error('❌ [CHANGE PASSWORD] المستخدم غير موجود');
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    if (user.password !== oldPassword) {
      console.error('❌ [CHANGE PASSWORD] كلمة المرور القديمة غير صحيحة');
      return NextResponse.json(
        { success: false, message: 'كلمة المرور القديمة غير صحيحة' },
        { status: 401 }
      );
    }

    // تحديث كلمة المرور
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', parseInt(userId));

    if (updateError) {
      console.error('❌ [CHANGE PASSWORD ERROR]:', updateError);
      return NextResponse.json(
        { success: false, message: 'خطأ في تغيير كلمة المرور' },
        { status: 500 }
      );
    }

    console.log(`✅ [CHANGE PASSWORD] تم تغيير كلمة المرور بنجاح`);
    return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });

  } catch (error: unknown) {
    console.error('❌ [CHANGE PASSWORD ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
