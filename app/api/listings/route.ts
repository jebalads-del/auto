import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { listings } from '@/lib/db/schema';

export async function GET() {
  try {
    const allListings = await db.select().from(listings);
    return NextResponse.json(allListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Error fetching listings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // 1. استقبال ملف الصورة المرفوع
    const file = formData.get('image') as File || formData.get('file') as File;
    
    let imageUrl = '';
    if (file && file.size > 0) {
      // 2. الرفع السحابي المباشر إلى Vercel Blob الموثق كـ Public
      const blob = await put(`cars/${Date.now()}-${file.name}`, file, {
        access: 'public',
      });
      imageUrl = blob.url; // الرابط الدائم الآمن
    }

    // 3. استقبال نصوص الإعلان
    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const year = formData.get('year') as string;
    const color = formData.get('color') as string;
    const mileage = formData.get('mileage') as string;

    // 4. الحفظ النهائي في قاعدة بيانات Neon
    const newListing = await db.insert(listings).values({
      title,
      price: price ? Number(price) : 0,
      year: year ? Number(year) : new Date().getFullYear(),
      color,
      mileage,
      image: imageUrl, // الرابط السحابي الثابت
    }).returning();

    return NextResponse.json(newListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Error creating listing' }, { status: 500 });
  }
}

