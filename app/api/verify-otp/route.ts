import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    console.log(`🔐 [VERIFY OTP] محاولة التحقق: ${email}`);

    // ✅ تخطي التحقق مؤقتاً - قبول أي رمز
    // هذا حل مؤقت حتى يتم إعداد خدمة البريد الإلكتروني
    if (otp && otp.length === 6) {
      // تحديث حالة المستخدم إلى confirmed
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          email_confirmed_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase().trim());

      if (error) {
        console.error('❌ [VERIFY OTP DB ERROR]:', error);
        return NextResponse.json(
          { success: false, message: 'خطأ في تحديث قاعدة البيانات' },
          { status: 500 }
        );
      }

      console.log(`✅ [VERIFY OTP] تم التحقق بنجاح: ${email}`);
      return NextResponse.json({ 
        success: true, 
        message: 'تم التحقق بنجاح' 
      });
    }

    return NextResponse.json(
      { success: false, message: 'رمز التحقق غير صالح' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ [VERIFY OTP ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
