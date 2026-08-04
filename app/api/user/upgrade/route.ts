import { NextResponse } from 'next/server';
import sql from '../db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'معرف المستخدم مطلوب'
            }, { status: 400 });
        }

        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return NextResponse.json({
                success: false,
                message: 'معرف المستخدم غير صحيح'
            }, { status: 400 });
        }

        // تحديث المستخدم إلى Premium باستخدام sql (neon)
        await sql`
            UPDATE users 
            SET subscription_type = 'premium', updated_at = NOW() 
            WHERE id = ${userId}
        `;

        return NextResponse.json({
            success: true,
            message: 'تم ترقية الحساب بنجاح إلى Premium!'
        });

    } catch (error: any) {
        console.error('Upgrade error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
