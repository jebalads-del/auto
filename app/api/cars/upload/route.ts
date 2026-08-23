import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

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

      // إنشاء اسم ملف فريد
      const fileExt = file.name.split('.').pop();
      const fileName = `${carId || 'temp'}/${Date.now()}.${fileExt}`;
      
      console.log(`📤 [UPLOAD] رفع الملف: ${fileName}`);

      // تحويل الملف إلى ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // رفع الملف إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('cars')
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ [UPLOAD ERROR] فشل رفع الملف:', error);
        continue;
      }

      // الحصول على الرابط العام
      const { data: urlData } = supabase.storage
        .from('cars')
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl;
      if (publicUrl) {
        uploadedUrls.push(publicUrl);
        console.log(`✅ [UPLOAD] تم رفع الملف بنجاح: ${publicUrl}`);
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
 
