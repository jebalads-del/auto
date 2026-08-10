import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price, description, image_url } = body;

    console.log('📩 توجيه الإعلان الجديد بكفاءة لجدول cars:', body);

    // استخدام صيغة الاستدعاء والاتصال الافتراضية الصحيحة والمجربة مسبقاً بنجاح في مشروعك
    await sql.query(
      "INSERT INTO cars (title, price, description, image_url, status, created_at, updated_at) VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())",
      [title, price, description, image_url]
    );

    return NextResponse.json({ success: true, message: '🎉 تم إرسال الإعلان بنجاح وينتظر موافقة الإدارة' });

  } catch (error: any) {
    console.error('❌ خطأ في حفظ الإعلان:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await sql.query("SELECT * FROM cars WHERE status = 'pending' ORDER BY id DESC");
    return NextResponse.json({ success: true, cars: result.rows || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
