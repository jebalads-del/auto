import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sql from '../../db'; // المعالج الرئيسي والمستقر للاتصال بقاعدة بياناتك

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 [UPLOAD] بدء عملية رفع الصور بصيغة JSONB...');
    
    const formData = await request.formData();
    
    // قراءة الملفات سواء أرسلتها الواجهة باسم 'file' أو 'images'
    const filesFromImages = formData.getAll('images') as File[];
    const filesFromFile = formData.getAll('file') as File[];
    const files = filesFromFile.length > 0 ? filesFromFile : filesFromImages;
    
    const carId = formData.get('carId') as string;

    if (!files || files.length === 0) {
      console.log('❌ [UPLOAD] لا توجد ملفات صالحة للرفع');
      return NextResponse.json({ success: false, message: 'لم يتم إرسال أي صور صالحة' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.CARS_BLOB_READ_WRITE_TOKEN || process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;

    for (const file of files) {
      if (file && file.size > 0) {
        console.log(`📸 [UPLOAD] جاري رفع ملف: ${file.name}`);
        const blob = await put(
          `cars/${carId}/${Date.now()}-${file.name}`,
          file,
          {
            access: 'public',
            token: blobToken,
            addRandomSuffix: true,
          }
        );
        if (blob && blob.url) {
          uploadedUrls.push(blob.url);
          console.log(`✅ [UPLOAD] تم الرفع بنجاح: ${blob.url}`);
        }
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ success: false, message: 'فشل رفع الصور إلى التخزين السحابي' }, { status: 500 });
    }

    const firstImageUrl = uploadedUrls[0] || '';
    const imagesString = uploadedUrls.join(',');

    // ✅ التعديل السحري: تحويل مصفوفة الروابط إلى نص JSON حقيقي قبل إرساله لقاعدة البيانات
    if (carId) {
      const targetId = parseInt(carId, 10);
      const jsonUrls = JSON.stringify(uploadedUrls); // تحويل ['url1', 'url2'] إلى '["url1", "url2"]'

      await sql`
        UPDATE cars 
        SET images = ${jsonUrls}::jsonb, 
            image_url = ${firstImageUrl},
            image = ${imagesString}
        WHERE id = ${targetId}
      `;
      console.log(`✅ [UPLOAD] تم تحديث السيارة رقم ${carId} بالصور في عمود JSONB بنجاح`);
    }

    return NextResponse.json({
      success: true,
      url: firstImageUrl,
      image_url: firstImageUrl,
      urls: uploadedUrls,
    });

  } catch (error: any) {
    console.error('❌ [UPLOAD ERROR]:', error);
    return NextResponse.json({ success: false, message: error.message || 'فشل رفع الصور' }, { status: 500 });
  }
}
