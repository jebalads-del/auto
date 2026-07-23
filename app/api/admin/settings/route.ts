import { NextResponse } from 'next/server';
import sql from '../../db';

export async function GET() {
  try {
    const settings = await sql`
      SELECT * FROM site_settings WHERE key IN (
        'western_union', 'paypal', 'premium_plan', 'commercial_ad'
      )
    `;

    const result: any = {};
    settings.forEach((row: any) => {
      result[row.key] = row.value;
    });

    return NextResponse.json({ success: true, settings: result });
  } catch (error) {
    console.error('خطأ في جلب الإعدادات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الإعدادات' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      await sql`
        INSERT INTO site_settings (key, value) 
        VALUES (${key}, ${JSON.stringify(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }

    return NextResponse.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  } catch (error) {
    console.error('خطأ في حفظ الإعدادات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حفظ الإعدادات' },
      { status: 500 }
    );
  }
}
