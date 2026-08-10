import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_wf0AZITP7Chv@ep-icy-frost-atd2gbfq-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export async function GET() {
  try {
    // جلب الطلبات قيد الانتظار
    const requests = await sql`SELECT * FROM featured_requests WHERE status = 'pending' ORDER BY created_at DESC`;
    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
