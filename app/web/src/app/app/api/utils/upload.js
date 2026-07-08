import { put } from '@vercel/blob';

export async function uploadFile(file) {
  if (!file) {
    throw new Error('لم يتم توفير ملف للرفع');
  }

  try {
    // توليد مسار واسم فريد لكل صورة سيارة منعاً للتكرار
    const fileName = `cars/${Date.now()}-${file.name || 'image.jpg'}`;

    // الرفع المباشر إلى مخازن Vercel السحابية العامة
    const blob = await put(fileName, file, {
      access: 'public',
    });

    // إرجاع الرابط الدائم والآمن (https://...) لتقوم قاعدة البيانات بحفظه وعرضه للزوار
    return blob.url;
  } catch (error) {
    console.error('خطأ أثناء الرفع السحابي عبر Vercel Blob:', error);
    throw new Error('فشل رفع الصورة إلى السحابة');
  }
}

