import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    // جلب كافة الملفات المرسلة تحت مسمى 'files' من صفحة النشر
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'لم يتم إرسال أي ملفات صور' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    // الرفع المتتالي لكافة الصور حياً إلى Vercel Blob
    for (const file of files) {
      if (file && file.size > 0) {
        // توليد اسم فريد للملف لتفادي التكرار
        const uniqueFilename = `car-${Date.now()}-${file.name}`;
        
        // استخدام دالة put المباشرة والمعتمدة على التوكن الافتراضي لـ Vercel تلقائياً
        const blob = await put(uniqueFilename, file, {
          access: 'public',
        });
        
        if (blob && blob.url) {
          uploadedUrls.push(blob.url);
        }
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: 'فشل رفع الصور إلى خادم التخزين' },
        { status: 500 }
      );
    }

    // إرجاع مصفوفة الروابط الحية والكاملة للواجهة بنجاح
    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });

  } catch (error) {
    console.error('خطأ قاتل أثناء رفع الصور لـ Blob:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ داخلي في خادم رفع الصور' },
      { status: 500 }
    );
  }
}
