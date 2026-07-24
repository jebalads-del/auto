import { NextRequest, NextResponse } from 'next/server';
import sql from '../../db';

export async function GET() {
  try {
    const cars = await sql`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM cars c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json({ success: true, cars });
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الإعلانات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📦 البيانات المستلمة:', body);
    
    const { 
      brand, 
      model, 
      year, 
      price, 
      kilometers, 
      color, 
      description, 
      images, 
      user_id, 
      payment_method,
      is_featured,
      featured_price,
      currency
    } = body;

    // ✅ التحقق من user_id
    if (!user_id || isNaN(user_id)) {
      console.log('❌ user_id غير صالح:', user_id);
      return NextResponse.json(
        { success: false, message: 'معرف المستخدم مطلوب أو غير صالح' },
        { status: 400 }
      );
    }

    // ✅ التحقق من وجود المستخدم
    const userCheck = await sql`
      SELECT id FROM users WHERE id = ${user_id}
    `;

    if (userCheck.length === 0) {
      console.log('❌ المستخدم غير موجود:', user_id);
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 400 }
      );
    }

    // ✅ إدراج الإعلان
    const result = await sql`
      INSERT INTO cars (
        brand, model, year, price, kilometers, color, 
        description, images, user_id, payment_method, 
        is_featured, featured_price, currency, status
      ) VALUES (
        ${brand}, ${model}, ${year || null}, ${price}, ${kilometers || null}, ${color || null},
        ${description || null}, ${images || null}, ${user_id}, ${payment_method || 'western_union'},
        ${is_featured || false}, ${featured_price || null}, ${currency || 'USD'}, 'pending'
      )
      RETURNING *
    `;

    console.log('✅ تم إنشاء الإعلان:', result[0]);

    return NextResponse.json({ 
      success: true, 
      car: result[0],
      message: 'تم إرسال الإعلان للمراجعة' 
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء الإعلان:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء إنشاء الإعلان: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
