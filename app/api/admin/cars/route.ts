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
    console.log('📦 البيانات المستلمة من الواجهة:', body);
    
    // ✅ استقبال الحقول بالاسم الصحيح
    const { 
      brand,        // الماركة
      model,        // الموديل
      year,         // السنة
      price,        // السعر
      kilometers,   // الممشى
      color,        // اللون
      description,  // الوصف
      images,       // الصور
      user_id,      // معرف المستخدم
      payment_method, // طريقة الدفع
      is_featured,  // هل هو مميز؟
      featured_price, // سعر التميز
      currency      // العملة
    } = body;

    // ✅ التحقق من الحقول المطلوبة
    if (!brand || !model || price === undefined || price === null || price === '') {
      console.log('❌ الحقول المطلوبة مفقودة:', { brand, model, price });
      return NextResponse.json(
        { success: false, message: 'الماركة، الموديل، والسعر مطلوبة' },
        { status: 400 }
      );
    }

    // التحقق من وجود user_id
    const userId = user_id || 1;

    // التحقق من وجود المستخدم
    const userCheck = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `;

    if (userCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 400 }
      );
    }

    // إدراج الإعلان في قاعدة البيانات
    const result = await sql`
      INSERT INTO cars (
        brand, model, year, price, kilometers, color, 
        description, images, user_id, payment_method, 
        is_featured, featured_price, currency, status
      ) VALUES (
        ${brand}, ${model}, ${year || null}, ${parseFloat(price)}, ${kilometers || null}, ${color || null},
        ${description || null}, ${images || null}, ${userId}, ${payment_method || 'western_union'},
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
