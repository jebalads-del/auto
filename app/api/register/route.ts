import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log('📝 [REGISTER] محاولة تسجيل مستخدم جديد:', email);

    // التحقق من صحة البيانات
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'البريد الإلكتروني مسجل بالفعل' },
        { status: 400 }
      );
    }

    // إضافة المستخدم الجديد
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ [REGISTER DB ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في قاعدة البيانات: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [REGISTER] تم تسجيل المستخدم: ${newUser.id}`);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (error: any) {
    console.error('❌ [REGISTER ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
