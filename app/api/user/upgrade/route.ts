import { NextResponse } from 'next/server';
import pool from '@/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'User ID is required'
            });
        }

        // تحديث المستخدم إلى Premium
        await pool.query(
            'UPDATE users SET subscription = $1, updated_at = NOW() WHERE id = $2',
            ['premium', id]
        );

        return NextResponse.json({
            success: true,
            message: 'User upgraded successfully'
        });

    } catch (error) {
        console.error('Upgrade error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}
