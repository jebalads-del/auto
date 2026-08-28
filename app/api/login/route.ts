import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log(`🔐 [LOGIN] محاولة تسجيل دخول: ${email}`);

    // ✅ رد بسيط للاختبار
    return NextResponse.json({
      success: true,
      message: 'API يعمل!',
      email: email,
      password: password
    });

  } catch (error: any) {
    console.error('❌ [LOGIN ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ' },
      { status: 500 }
    );
  }
}
