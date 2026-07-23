import { NextRequest, NextResponse } from 'next/server';
import sql from '../db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const offset = (page - 1) * limit;

    // جلب العدد الإجمالي
    const countResult = await sql`
      SELECT COUNT(*) as total FROM cars WHERE status = 'approved'
    `;
    const total = parseInt(countResult[0].total);

    // جلب السيارات مع Pagination
    const cars = await sql`
      SELECT id, brand, model, year, price, kilometers, color, 
             description, images, status, created_at 
      FROM cars 
      WHERE status = 'approved' 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return NextResponse.json(
      {
        success: true,
        cars,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('خطأ في جلب الإعلانات:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب الإعلانات' },
      { status: 500 }
    );
  }
}
