import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const carId = body.carId || body.id || body.car_id;
    let action = body.action;

    if (!action && body.status) {
      if (body.status === 'approved' || body.status === 'active') action = 'approve';
      else if (body.status === 'rejected') action = 'reject';
      else if (body.status === 'sold') action = 'sold';
    }

    console.log('📩 معالجة طلب سيارة حية:', { carId, action });

    if (!carId || !action) {
      return NextResponse.json({ success: false, message: 'معطيات المعايير ناقصة' }, { status: 200 });
    }

    if (action === 'approve') {
      await sql`UPDATE cars SET status = 'approved', updated_at = NOW() WHERE id = ${carId}`;
      return NextResponse.json({ success: true, message: '✅ تمت الموافقة على السيارة بنجاح وسجلت بالموقع' });
    } 
    
    if (action === 'sold') {
      await sql`UPDATE cars SET status = 'sold', updated_at = NOW() WHERE id = ${carId}`;
      return NextResponse.json({ success: true, message: '💰 تم وضع علامة مباع على الإعلان بنجاح وتحديث المتجر' });
    }

    if (action === 'delete') {
      await sql`DELETE FROM cars WHERE id = ${carId}`;
      return NextResponse.json({ success: true, message: '🗑️ تم حذف إعلان السيارة بنجاح' });
    }

    return NextResponse.json({ success: false, message: 'إجراء غير مدعوم حالياً' });

  } catch (error: any) {
    console.error('❌ خطأ في دالة التحكم بالسيارات:', error);
    return NextResponse.json({ success: false, message: 'حدث تعارض في السيرفر: ' + error.message }, { status: 200 });
  }
}
