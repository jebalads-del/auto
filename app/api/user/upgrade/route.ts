import { NextResponse } from 'next/server';
import sql from '../../../db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'معرف المستخدم مطلوب' }, { status: 400 });
    }

    // 👑 تحديث حقل الترقية الفعلي المكتوب بشاشتك وتغيير قيمته النصية إلى 'premium'
    await sql`
      UPDATE users 
      SET subscription_type = 'premium' 
      WHERE id = ${parseInt(id, 10)}
    `;

    return NextResponse.json({ success: true, message: 'تم تفعيل باقة Premium بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
