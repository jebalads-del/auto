import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sql from '../db'

export async function GET() {
  try {
    const ads = await sql`SELECT * FROM ads ORDER BY id DESC`;
    return NextResponse.json(ads || [])
  } catch (error) {
    console.error(error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    // قراءة البيانات المرسلة كـ FormData لدعم رفع ملفات الصور الحية
    const formData = await request.formData()
    
    // جلب حقول النصوص العادية من الاستمارة
    const title = formData.get('title') as string
    const price = formData.get('price') as string
    const description = (formData.get('description') as string) || ''
    const brand = (formData.get('brand') as string) || ''
    const model = (formData.get('model') as string) || ''
    const year = formData.get('year') as string
    const color = (formData.get('color') as string) || ''
    const mileage = formData.get('mileage') as string
    const extra_info = (formData.get('extra_info') as string) || ''
    
    // جلب ملف الصورة المرفوع حياً من الهاتف
    const imageFile = formData.get('image') as File || formData.get('image_url') as File
    let finalImageUrl = ""

    // إذا كانت هناك صورة مرفوعة، يتم إرسالها فوراً إلى Vercel Blob Storage بأمان
    if (imageFile && imageFile.size > 0 && typeof imageFile !== 'string') {
      const blobFilename = `car-${Date.now()}-${imageFile.name}`;
      const blobResult = await put(blobFilename, imageFile, {
        access: 'public',
        contentType: imageFile.type
      });
      finalImageUrl = blobResult.url; // استخلاص رابط الصورة النظيف والنهائي
    } else if (typeof imageFile === 'string') {
      finalImageUrl = imageFile; // في حال تم إرسال الرابط جاهزاً كنص
    }
    // إدخال البيانات المكتملة مع رابط صورة Vercel Blob الفعلي داخل قاعدة البيانات
    const result = await sql`
      INSERT INTO ads (
        title, price, description, image_url, status, 
        brand, model, year, color, mileage, extra_info
      )
      VALUES (
        ${title || ''}, ${price || '0'}, ${description}, ${finalImageUrl}, 'pending',
        ${brand}, ${model}, ${year ? Number(year) : null}, ${color}, ${mileage ? Number(mileage) : null}, ${extra_info}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error processing ad post:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body
    await sql`UPDATE ads SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false })
    await sql`DELETE FROM ads WHERE id = ${id}`;
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
