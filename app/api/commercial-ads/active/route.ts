import { NextResponse } from 'next/server';
import sql from '../../db';

export async function GET() {
  try {
    const ads = await sql`
      SELECT * FROM commercial_ads 
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, ads });
  } catch (error) {
    console.error('خطأ في جلب الإعلانات التجارية:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    );
  }
}
