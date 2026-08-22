import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    console.log(`🔐 [LOGIN] محاولة تسجيل دخول للحساب: ${email}`);

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, password, role, status')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error) {
      console.error('❌ [LOGIN DB ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في قاعدة البيانات: ' + error.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.log('❌ [LOGIN] الحساب غير موجود');
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const user = users[0];
    const isPasswordValid = password === user.password || user.password?.includes(password);

    if (!isPasswordValid) {
      console.log('❌ [LOGIN] كلمة المرور غير مطابقة');
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    console.log(`✅ [LOGIN] تم التحقق بنجاح! الرتبة: ${user.role}`);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        status: user.status || 'active'
      }
    });

  } catch (error: unknown) {
    console.error('❌ [LOGIN ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
