import { NextResponse } from 'next/server';
import sql from '../db';

export async function GET() {
  try {
    const ads = await sql`SELECT * FROM ads ORDER BY id DESC`;
    // في حال نجاح الاستعلام، نتأكد من إرجاع البيانات أو مصفوفة فارغة
    return NextResponse.json(ads || []);
  } catch (error) {
    console.error("Neon GET Error:", error);
    // حماية واجهة الموقع: إرجاع مصفوفة فارغة لتجنب ظهور الرسالة الحمراء
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, price, description } = body;

    const result = await sql`
      INSERT INTO ads (title, price, description)
      VALUES (${title}, ${price}, ${description || ''})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Neon POST Error:", error);
    return NextResponse.json({ success: false, error: 'فشل في إضافة الإعلان' }, { status: 500 });
  }
}

