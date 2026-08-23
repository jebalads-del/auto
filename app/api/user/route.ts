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
