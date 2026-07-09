import { NextResponse } from 'next/server'
import sql from '../../db'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = Number(resolvedParams.id)
    const body = await request.json()
    const { title, price, description } = body

    const result = await sql`
      UPDATE ads 
      SET title = ${title}, price = ${price}, description = ${description || ''} 
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'الإعلان غير موجود في جدول قاعدة البيانات' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: `تم تحديث قاعدة بيانات Neon بنجاح فورياً` })
  } catch (error) {
    console.error("Neon PUT Error:", error)
    return NextResponse.json({ success: false, error: 'فشل في تحديث البيانات سحابياً' }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = Number(resolvedParams.id)
    
    console.log("Fetching detailed info for URL:", request.url)
    
    const adArray = await sql`SELECT * FROM ads WHERE id = ${id}`;

    if (adArray.length === 0) {
      return NextResponse.json({ error: 'الإعلان غير موجود' }, { status: 404 })
    }

    // هنا الإصلاح القاطع: نرسل العنصر الأول من المصفوفة مباشرة ككائن مفرد لتفهمه واجهة المتصفح
    return NextResponse.json(adArray[0])
  } catch (error) {
    console.error("Neon Single GET Error:", error)
    return NextResponse.json({ error: 'خطأ في جلب تفاصيل الإعلان من Neon' }, { status: 500 })
  }
}
