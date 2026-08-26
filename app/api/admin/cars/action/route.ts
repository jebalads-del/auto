import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // استقبال الـ carId والـ action وأي متغيرات إضافية ترسلها الواجهة
    const body = await request.json();
    const { carId, action, status } = body;

    if (!carId) {
      return NextResponse.json({ success: false, message: 'معرف السيارة مطلوب' }, { status: 400 });
    }

    console.log(`⚙️ [ADMIN ACTION] إجراء قادم على السيارة ${carId}:`, body);

    // 1. تحديد الحالة الجديدة ديناميكياً بناءً على الـ action أو الـ status القادم
    let newStatus = status || 'قيد الانتظار';
    
    if (action === 'approve') newStatus = 'مقبول';
    if (action === 'reject') newStatus = 'مرفوض';
    if (action === 'sell' || action === 'sold') newStatus = 'مباع';
    
    // إذا أرسلت الواجهة أي قيمة أخرى غير متوقعة، نعتمد على قيمة الـ action نفسه أو الـ status كحالة
    if (!status && action !== 'approve' && action !== 'reject' && action !== 'sell' && action !== 'sold') {
      newStatus = action; 
    }

    // 2. تحديث جدول السيارات في Supabase بالحالة الجديدة فوراً
    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', carId);

    if (error) {
      console.error('❌ [SUPABASE UPDATE ERROR]:', error.message);
      return NextResponse.json({ success: false, message: 'خطأ في تحديث الجدول: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `تم تحديث حالة السيارة بنجاح إلى: ${newStatus}`
    });

  } catch (error: unknown) {
    console.error('❌ [ADMIN ACTION CRASH]:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ داخلي في السيرفر' }, { status: 500 });
  }
}
