import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [USERS LIST] جلب قائمة المستخدمين...');

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, status')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [USERS LIST ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب المستخدمين' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: users || []
    });

  } catch (error: unknown) {
    console.error('❌ [USERS LIST ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
