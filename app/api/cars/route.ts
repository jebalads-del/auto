import { NextResponse } from 'next/server';
import sql from '../db';

export async function GET() {
  try {
    // ✅ جلب الإعلانات الموافق عليها فقط
    const cars = await sql`
      SELECT * FROM cars 
      WHERE status = 'approved' 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, cars });
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الإعلانات' },
      { status: 500 }
    );
  }
}
