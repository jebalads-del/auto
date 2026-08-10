import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_wf0AZITP7Chv@ep-icy-frost-atd2gbfq-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export async function POST(request: Request) {
  try {
    const { requestId, carId, action } = await request.json();
    
    if (action === 'approve') {
      // 1. تحديث السيارة لتصبح مميزة في جدول السيارات (تأكد من اسم الحقل في جدولك، غالباً is_featured أو featured)
      await sql`UPDATE cars SET is_featured = true WHERE id = ${Number(carId)}`;
      // 2. تحديث حالة الطلب كمقبول
      await sql`UPDATE featured_requests SET status = 'approved' WHERE id = ${Number(requestId)}`;
    } else {
      // تحديث حالة الطلب كمرفوض
      await sql`UPDATE featured_requests SET status = 'rejected' WHERE id = ${Number(requestId)}`;
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
