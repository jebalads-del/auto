import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../db';

export async function POST(request: NextRequest) {
  try {
    const { adId, action } = await request.json();

    if (!adId || !action) {
      return NextResponse.json(
        { success: false, message: 'معرف الإعلان والإجراء مطلوبان' },
        { status: 400 }
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const message = action === 'approve' ? 'تمت الموافقة على الإعلان' : 'تم رفض الإعلان';

    await sql`
      UPDATE commercial_ads 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${adId}
    `;

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('خطأ في التحكم بالإعلان:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تنفيذ الإجراء' },
      { status: 500 }
    );
  }
}
