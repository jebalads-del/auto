import { NextResponse } from 'next/server'
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
    const body = await request.json()
    const { title, price, description, image_url } = body

    const result = await sql`
      INSERT INTO ads (title, price, description, image_url, status)
      VALUES (${title}, ${price}, ${description || ''}, ${image_url || ''}, 'pending')
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false }, { status: 500 })
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
