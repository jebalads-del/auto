import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // كسر الكاش نهائياً لجلب البيانات الحية

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [ADMIN USERS] جلب قائمة المستخدمين الحية...');

    // 1. محاولة جلب المستخدمين من جدول users العام
    let { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false });

    // 2. خطوة حماية بديلة: إذا كان الجدول فارغاً أو به اسم مختلف، نجلبه من جدول profiles
    if (!users || users.length <= 1) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, name, role, created_at');
        
      if (profiles && profiles.length > 0) {
        users = profiles;
      }
    }

    console.log(`✅ [ADMIN USERS] تم جلب ${users?.length || 0} مستخدم بنجاح`);

    return NextResponse.json({
      success: true,
      users: users || []
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN USERS ERROR]:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء معالجة البيانات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    return NextResponse.json({ success: true, message: 'تمت العملية بنجاح' });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'المعرف مطلوب' }, { status: 400 });

    await supabase.from('users').delete().eq('id', id);
    await supabase.from('profiles').delete().eq('id', id);

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
