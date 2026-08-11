import { NextRequest, NextResponse } from 'next/server';
import sql from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب كافة إعلانات السيارات الحية للإدارة والموقع...');
    
    // تعديل الشرط لجلب كافة الحالات بما فيها المعلقة pending والنشطة والمباعة
    const cars = await sql`
      SELECT id, title, price, description, image_url, status, created_at 
      FROM cars 
      WHERE status IS NULL OR status IN ('pending', 'approved', 'active', 'sold', 'rejected')
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, cars: cars || [] });
  } catch (error: any) {
    console.error('❌ خطأ في جلب السيارات:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price, description, image_url } = body;

    await sql`
      INSERT INTO cars (title, price, description, image_url, status, created_at, updated_at)
      VALUES (${title}, ${price}, ${description}, ${image_url}, 'pending', NOW(), NOW())
    `;

    return NextResponse.json({ success: true, message: '🎉 تم إرسال الإعلان بنجاح وينتظر موافقة الإدارة' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
