import { NextResponse } from 'next/server';
import sql from '../db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 🛡️ استخراج الحقول وترجمتها فوراً لصيغة قاعدة البيانات الصحيحة (Snake Case)
    const userId = body.userId || body.user_id;
    const position = String(body.position || 'header').toLowerCase();
    const price = parseFloat(body.price) || 0;
    const durationDays = parseInt(body.durationDays || body.duration_days, 10) || 30;
    const imageUrl = body.imageUrl || body.image_url || '';

    if (!userId || !imageUrl) {
      return NextResponse.json({ success: false, message: 'بيانات المستخدم أو رابط الصورة مفقود' }, { status: 400 });
    }

    // ⚡ حساب تاريخ البداية والنهاية تلقائياً للإعلان التجاري
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    // 🚀 إدخال البيانات في مصفوفة Neon Postgres الصافية بحالتها الافتراضية المقبولة
    await sql`
      INSERT INTO commercial_ads (user_id, position, status, price, duration_days, start_date, end_date, image_url)
      VALUES (${userId}, ${position}, 'approved', ${price}, ${durationDays}, ${startDate}, ${endDate}, ${imageUrl})
    `;

    return NextResponse.json({ success: true, message: 'تم إرسال وحفظ الإعلان بنجاح في قاعدة البيانات' });
  } catch (error: any) {
    console.error("Ad creation API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
