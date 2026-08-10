import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_wf0AZITP7Chv@ep-icy-frost-atd2gbfq-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export async function POST(request: Request) {
  try {
    const { carId } = await request.json();
    
    // تحديث حالة السيارة إلى مباعة في قاعدة البيانات
    await sql`UPDATE cars SET status = 'sold' WHERE id = ${Number(carId)}`;
    
    return NextResponse.json({ success: true, message: 'تم تعيين السيارة كمباعة بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
