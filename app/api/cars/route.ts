export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '../db';

// دالة ذكية ومؤقتة لقراءة البنية الفعالية للأعمدة من داخل نظام معلومات قاعدة البيانات
export async function GET() {
  try {
    const tableStructure = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cars'
    `;
    return NextResponse.json(tableStructure || []);
  } catch (error) {
    console.error("Neon GET Structure Error:", error);
    return NextResponse.json({ error: String(error) });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: false, message: "Under maintenance to fetch structure" }, { status: 500 });
}
