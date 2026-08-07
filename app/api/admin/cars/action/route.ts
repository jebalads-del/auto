import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // دعم الصيغتين القديمة والجديدة لحل مشكلة تعارض المعايير
    const carId = body.carId || body.id;
    let action = body.action;
    
    if (!action && body.status) {
      if (body.status === 'approved') action = 'approve';
      else if (body.status === 'rejected') action = 'reject';
      else if (body.status === 'sold') action = 'sold';
    }

    console.log('📩 طلب معالج:', { carId, action });

    if (!carId || !action) {
      return NextResponse.json(
        { success: false, message: 'معرف الإعلان والإجراء مطلوبان وتأكد من المعايير المرسلة' },
        { status: 400 }
      );
    }

    let query = null;
    let message = '';

    switch (action) {
      case 'approve':
        query = sql`
          UPDATE cars
          SET status = 'approved', updated_at = NOW()
          WHERE id = ${carId}
        `;
        message = '✅ تمت الموافقة على الإعلان بنجاح';
        break;

      case 'reject':
        query = sql`
          UPDATE cars
          SET status = 'rejected', updated_at = NOW()
          WHERE id = ${carId}
        `;
        message = '❌ تم رفض الإعلان';
        break;

      case 'sold':
        query = sql`
          UPDATE cars
          SET status = 'sold', updated_at = NOW()
          WHERE id = ${carId}
        `;
        message = '💰 تم وضع علامة مباع على الإعلان';
        break;

      case 'delete':
        query = sql`
          DELETE FROM cars WHERE id = ${carId}
        `;
        message = '🗑️ تم حذف الإعلان بنجاح';
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'إجراء غير معروف' },
          { status: 400 }
        );
    }

    if (query) {
      await query;
      console.log(`✅ ${action} تم تنفيذها على السيارة ${carId}`);
    }

    return NextResponse.json({ success: true, message });

  } catch (error) {
    console.error('❌ خطأ في التحكم بالإعلان:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تنفيذ الإجراء' },
      { status: 500 }
    );
  }
}
