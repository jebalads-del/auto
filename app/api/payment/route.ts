import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_wf0AZITP7Chv@ep-icy-frost-atd2gbfq-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export async function POST(request: Request) {
  try {
    const { paypalEmail, westernName, westernCountry } = await request.json();
    await sql`DELETE FROM site_payment_settings`;
    await sql`
      INSERT INTO site_payment_settings (paypal_email, western_name, western_country) 
      VALUES (${paypalEmail}, ${westernName}, ${westernCountry})
    `;
    return NextResponse.json({ success: true, message: 'تم حفظ بيانات المستلم بنجاح' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء الحفظ' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await sql`SELECT * FROM site_payment_settings LIMIT 1`;
    return NextResponse.json(data[0] || { paypal_email: '', western_name: '', western_country: '' });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
  }
}
