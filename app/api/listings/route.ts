import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema';

export async function GET() {
  try {
    const allListings = await db.select().from(listings);
    return NextResponse.json(allListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newListing = await db.insert(listings).values({
      name: body.name,
      year: body.year,
      price: body.price,
      currency: body.currency || 'KWD',
      status: body.status || 'pending',
      image: body.image || '',
      description: body.description || '',
      createdAt: new Date(),
    }).returning();
    
    return NextResponse.json(newListing[0]);
  } catch (error) {
    console.error('Error adding listing:', error);
    return NextResponse.json({ error: 'فشل في إضافة الإعلان' }, { status: 500 });
  }
}
