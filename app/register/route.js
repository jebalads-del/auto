import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    console.log('📝 البيانات المستقبلة:', { name, email })

    // تحقق من البيانات
    if (!name || !email || !password) {
      return Response.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // تحقق من البريد الإلكتروني
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return Response.json(
        { error: 'البريد الإلكتروني موجود بالفعل' },
        { status: 409 }
      )
    }

    // أدرج المستخدم
    const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${password})
      RETURNING id, email, name
    `

    console.log('✅ تم التسجيل:', result[0])

    return Response.json({
      success: true,
      message: 'تم التسجيل بنجاح',
      user: result[0]
    }, { status: 201 })

  } catch (error) {
    console.error('❌ خطأ في API:', error)
    return Response.json(
      { error: 'خطأ في الخادم: ' + error.message },
      { status: 500 }
    )
  }
}
