import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // تحقق من البيانات
    if (!name || !email || !password) {
      return Response.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // أدرج المستخدم في قاعدة البيانات
    const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${password})
      RETURNING id, email
    `

    return Response.json({
      success: true,
      message: 'تم التسجيل بنجاح',
      user: result[0]
    })
  } catch (error) {
    console.error('خطأ:', error)
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
