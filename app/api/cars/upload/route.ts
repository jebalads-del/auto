import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 [SUPABASE UPLOAD] بدء عملية رفع الصور المستقرة...');
    
    // 🔴 التحقق من وجود متغيرات البيئة
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL غير معرف');
      return NextResponse.json(
        { success: false, message: 'خطأ في التكوين: NEXT_PUBLIC_SUPABASE_URL غير معرف' },
        { status: 500 }
      );
    }

    if (!supabaseKey) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY غير معرف');
      return NextResponse.json(
        { success: false, message: 'خطأ في التكوين: NEXT_PUBLIC_SUPABASE_ANON_KEY غير معرف' },
        { status: 500 }
      );
    }

    console.log('✅ Supabase URL موجود:', supabaseUrl);
    console.log('✅ Supabase Key موجود (جزء منه):', supabaseKey.substring(0, 20) + '...');

    const formData = await request.formData();
    const filesFromImages = formData.getAll('images') as File[];
    const filesFromFile = formData.getAll('file') as File[];
    const files = filesFromFile.length > 0 ? filesFromFile : filesFromImages;
    
    const carId = formData.get('carId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'لم يتم استقبال أي صور صالحة' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const fileName = `cars/${carId}/${Date.now()}-${file.name}`;
        console.log(`📸 [SUPABASE] جاري رفع ملف: ${fileName}`);

        const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/public/cars/${fileName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': file.type,
          },
          body: file
        });

        if (uploadRes.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/cars/${fileName}`;
          uploadedUrls.push(publicUrl);
          console.log(`✅ [SUPABASE] تم الرفع بنجاح: ${publicUrl}`);
        } else {
          const errText = await uploadRes.text();
          console.error(`❌ [SUPABASE STORAGE ERROR]:`, errText);
        }
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ success: false, message: 'فشل رفع الصور إلى استوديو Supabase' }, { status: 500 });
    }

    const firstImageUrl = uploadedUrls[0] || '';
    const jsonUrls = JSON.stringify(uploadedUrls);

    if (carId) {
      const targetId = parseInt(carId, 10);
      await sql`
        UPDATE cars 
        SET images = ${jsonUrls}, 
            image_url = ${firstImageUrl},
            image = ${jsonUrls}
        WHERE id = ${targetId}
      `;
      console.log(`✅ [SUPABASE DB] تم ربط الصور بالسيارة رقم ${carId} بنجاح`);
    }

    return NextResponse.json({
      success: true,
      url: firstImageUrl,
      image_url: firstImageUrl,
      urls: uploadedUrls,
    });

  } catch (error: any) {
    console.error('❌ [SUPABASE UPLOAD ERROR]:', error);
    return NextResponse.json({ success: false, message: error.message || 'فشل رفع الصور' }, { status: 500 });
  }
}
