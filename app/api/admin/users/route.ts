import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [ADMIN USERS] جلب قائمة المستخدمين...');

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [ADMIN USERS ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب المستخدمين: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [ADMIN USERS] تم جلب ${users?.length || 0} مستخدم`);

    return NextResponse.json({
      success: true,
      users: users || []
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN USERS ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
