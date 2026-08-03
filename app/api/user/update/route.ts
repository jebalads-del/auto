import { NextResponse } from 'next/server';
import sql from '@/app/api/db';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, phone, password } = body;

    if (!id || !name || !phone) {
      return NextResponse.json({ success: false, message: 'البيانات الأساسية مطلوبة' }, { status: 400 });
    }

    if (password && password.trim() !== '') {
      // تحديث البيانات مع كلمة السر الجديدة
      await sql`
        UPDATE users 
        SET name = ${name}, phone = ${phone}, password = ${password} 
        WHERE id = ${parseInt(id, 10)}
      `;
    } else {
      // تحديث البيانات فقط والإبقاء على كلمة السر الحالية
      await sql`
        UPDATE users 
        SET name = ${name}, phone = ${phone} 
        WHERE id = ${parseInt(id, 10)}
      `;
    }

    return NextResponse.json({ success: true, message: 'تم تحديث البيانات الشخصية بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
