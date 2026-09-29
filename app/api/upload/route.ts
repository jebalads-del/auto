import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase env vars');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const carId = formData.get('carId') as string;

    if (!file || !carId) {
      return NextResponse.json(
        { success: false, message: 'الملف ومعرف الإعلان مطلوبان' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${carId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `cars/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('car-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('❌ فشل الرفع:', uploadError);
      return NextResponse.json(
        { success: false, message: uploadError.message },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('car-images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    });

  } catch (error: any) {
    console.error('❌ خطأ:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ' },
      { status: 500 }
    );
  }
}
