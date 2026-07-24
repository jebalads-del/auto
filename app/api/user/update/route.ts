import { NextResponse } from 'next/server';
import sql from '../../db';

export async function POST(request: Request) {
  try {
    const { userId, name, phone } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // ✅ تحديث الاسم ورقم الهاتف (الإيميل غير قابل للتعديل)
    await sql`
      UPDATE users 
      SET 
        name = COALESCE(${name}, name),
        phone = COALESCE(${phone}, phone)
      WHERE id = ${userId}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث الملف الشخصي بنجاح' 
    });
  } catch (error) {
    console.error('خطأ في تحديث الملف الشخصي:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء التحديث' },
      { status: 500 }
    );
  }
}
