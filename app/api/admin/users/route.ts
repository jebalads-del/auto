import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

// 1. دالة جلب قائمة المستخدمين المحدثة لـ Supabase
export async function GET(request: NextRequest) {
  try {
    console.log('📋 [ADMIN USERS] جلب قائمة المستخدمين من سوبابيس...');

    // جلب الحقول المتوفرة والمستقرة فقط في جدول قاعدة البيانات لتفادي أخطاء الاستعلام
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [ADMIN USERS ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في جلب المستخدمين: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [ADMIN USERS] تم جلب ${users?.length || 0} مستخدم بنجاح`);

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

// 2. دالة حذف مستخدم متوافقة مع معرفات الـ UUID لـ Supabase
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // الـ ID القادم من سوبابيس يكون UUID (نصي)

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // تأمين برمجيات الحذف لمنع إزالة المدير المسؤول (حساب الأدمن الرئيسي المعتمد لديك)
    if (id === 'admin' || id === '1') {
      return NextResponse.json(
        { success: false, message: 'لا يمكن حذف المدير الرئيسي للموقع' },
        { status: 403 }
      );
    }

    console.log(`🗑️ [ADMIN USERS] جاري حذف المستخدم ذو المعرف: ${id}`);

    // تنفيذ الحذف المباشر والمستقر بالـ UUID من جدول قاعدة البيانات وسيتكفل الـ Cascade بحذفه أمنياً أيضاً
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [ADMIN USERS DELETE ERROR]:', error);
      return NextResponse.json(
        { success: false, message: 'خطأ في حذف المستخدم: ' + error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [ADMIN USERS] تم حذف المستخدم بنجاح: ${id}`);
    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN USERS DELETE ERROR]:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
