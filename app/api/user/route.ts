import { NextResponse } from 'next/server';
import sql from '../db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ success: false, message: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    const userId = parseInt(idParam, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: 'معرف المستخدم غير صحيح' }, { status: 400 });
    }

    // 🚀 استعلام صريح يعتمد المسميات الحقيقية المأخوذة من شاشتك بالملي
    const users = await sql`
      SELECT id, name, email, phone, subscription_type 
      FROM users 
      WHERE id = ${userId} 
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, message: 'المستخدم غير موجود بالنظام' }, { status: 404 });
    }

    // ✨ التفكيك الهندسي السليم: إرسال الكائن الصافي الأول مباشرة (العنصر 0) لسحق الفراغ بالواجهة
    const currentUser = users[0];
    
    // تحويل حالة الاشتراك لتتوافق برمجياً مع متغير الواجهة
    const responseUser = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
      is_premium: currentUser.subscription_type === 'premium'
    };

    return NextResponse.json({ success: true, user: responseUser });
  } catch (error: any) {
    console.error("Fetch user API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
