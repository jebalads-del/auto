import { NextResponse } from 'next/server';
import sql from '../../db';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, name, email, role, status, created_at
      FROM users
      ORDER BY id DESC
    `;

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, message: 'Error' });
  }
}
