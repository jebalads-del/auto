import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await request.json()
    const { title, price, description } = body

    // هنا كود تحديث قاعدة البيانات الخاص بك
    return NextResponse.json({ success: true, message: `تم تحديث الإعلان رقم ${id} بنجاح` })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'فشل في تحديث البيانات' }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    
    return NextResponse.json({
      id: Number(id),
      title: 'سيارة محددة',
      price: '100,000',
      description: 'وصف السيارة الحالي من قاعدة البيانات'
    })
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}
