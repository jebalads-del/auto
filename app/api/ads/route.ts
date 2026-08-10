import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price, description, image_url } = body;

    console.log('📩 استقبال إعلان سيارة جديد عبر مسار ads:', body);

    // توجيه الحفظ الفعلي إلى جدول cars لكي يقبله السيرفر ويظهر للأدمن
    await sql`
      INSERT INTO cars (title, price, description, image_url, status, created_at, updated_at)
      VALUES (${title}, ${price}, ${description}, ${image_url}, 'pending', NOW(), NOW())
    `;

    return NextResponse.json({ success: true, message: '🎉 تم إرسال الإعلان بنجاح وينتظر موافقة الإدارة' });

  } catch (error: any) {
    console.error('❌ خطأ في حفظ الإعلان عبر ads:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cars = await sql`SELECT * FROM cars WHERE status = 'pending' ORDER BY id DESC`;
    return NextResponse.json({ success: true, cars });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
