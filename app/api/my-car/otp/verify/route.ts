import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, otp } = await request.json();

  if (typeof email !== 'string' || !email.trim() || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    return NextResponse.json(
      { success: false, error: 'البريد الإلكتروني ورمز التحقق المكون من 6 أرقام مطلوبان' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: otp,
    type: 'email',
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'الرمز غير صحيح' },
      { status: 400 }
    );
  }

  if (data.user) {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!existingUser && !checkError) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'مستخدم',
        role: 'user',
        status: 'active',
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: 'تم التحقق بنجاح',
    user: data.user,
  });
}
