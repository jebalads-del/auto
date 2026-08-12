export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import sql from '../db';

export async function GET() {
  try {
    const cars = await sql`SELECT * FROM cars ORDER BY id DESC`;
    return NextResponse.json(cars || []);
  } catch (error) {
    console.error("Neon GET Error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // استخراج الحقول الدقيقة والمطابقة 100% لبنية جدول cars الأصلي بمشروعك
    const brand = body.brand || '';
    const model = body.model || '';
    const year = body.year ? Number(body.year) : null;
    const price = body.price ? Number(body.price) : 0;
    const kilometers = body.kilometers ? Number(body.kilometers) : 0;
    const color = body.color || '';
    const description = body.description || body.notes || '';
    const currency = body.currency || '$';
    const images = body.images || '';
    const status = body.status || 'pending';

    const result = await sql`
      INSERT INTO cars (brand, model, year, price, kilometers, color, description, currency, images, status)
      VALUES (${brand}, ${model}, ${year}, ${price}, ${kilometers}, ${color}, ${description}, ${currency}, ${images}, ${status})
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Neon POST Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    await sql`UPDATE cars SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false });
    await sql`DELETE FROM cars WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
