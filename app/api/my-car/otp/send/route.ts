import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (typeof email !== 'string' || !email.trim()) {
    return NextResponse.json(
      { success: false, message: 'البريد الإلكتروني مطلوب' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: 'تم إرسال رمز التحقق بنجاح' });
}
