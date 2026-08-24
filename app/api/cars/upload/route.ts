import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 [UPLOAD] بدء عملية رفع الصور...');

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const carId = formData.get('carId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'لم يتم استقبال أي صور' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ متغيرات البيئة غير معرفة');
      return NextResponse.json(
        { success: false, message: 'خطأ في تكوين الخادم' },
        { status: 500 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;

      const fileExt = file.name.split('.').pop();
      const fileName = `cars/${carId || 'temp'}/${Date.now()}.${fileExt}`;

      console.log(`📤 [UPLOAD] رفع الملف: ${fileName}`);

      try {
        // رفع الملف باستخدام fetch مباشرة
        const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/public/cars/${fileName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': file.type,
          },
          body: file,
        });

        if (uploadRes.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/cars/${fileName}`;
          uploadedUrls.push(publicUrl);
          console.log(`✅ [UPLOAD] تم رفع الملف بنجاح: ${publicUrl}`);
        } else {
          const errText = await uploadRes.text();
          console.error('❌ [UPLOAD ERROR] فشل رفع الملف:', errText);
        }
      } catch (err) {
        console.error('❌ [UPLOAD ERROR] استثناء:', err);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: 'فشل رفع جميع الصور' },
        { status: 500 }
      );
    }

    console.log(`✅ [UPLOAD] تم رفع ${uploadedUrls.length} صورة بنجاح`);

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      image_url: uploadedUrls[0]
    });

  } catch (error: any) {
    console.error('❌ [UPLOAD ERROR]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ أثناء رفع الصور' },
      { status: 500 }
    );
  }
}
