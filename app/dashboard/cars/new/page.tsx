'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const currencies = [
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي' },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي' },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي' },
  { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري' },
  { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني' },
  { code: 'OMR', symbol: 'ر.ع', name: 'ريال عماني' },
];

export default function NewCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    brand: '', model: '', year: new Date().getFullYear(),
    price: '', kilometers: '', color: '', description: '',
    payment_method: 'western_union', currency: 'KWD',
  });

  const brands = ['تويوتا', 'هوندا', 'مرسيدس', 'بي إم دبليو', 'أودي', 'فولكس واجن', 'فورد', 'شيفروليه', 'نيسان', 'هيونداي', 'كيا', 'مازدا', 'لكزس', 'جيب', 'رينو', 'بيجو', 'سيات', 'ميتسوبيشي', 'سوبارو', 'فولفو'];
  const colors = ['أسود', 'أبيض', 'أحمر', 'أزرق', 'رمادي', 'فضي', 'ذهبي', 'بني', 'أخضر', 'أصفر', 'برتقالي', 'أرجواني', 'وردي'];

  const modelsMap: Record<string, string[]> = {
    'تويوتا': ['كامري', 'كورولا', 'لاندكروزر', 'برادو', 'أفالون', 'راف فور', 'يارس', 'هيلوكس', 'أخرى'],
    'هوندا': ['أكورد', 'سيفيك', 'سي آر في', 'بايلوت', 'أوديسي', 'سيتي', 'أخرى'],
    'مرسيدس': ['الفئة C', 'الفئة E', 'الفئة S', 'GLC', 'GLE', 'G-Class', 'CLA', 'A-Class', 'أخرى'],
    'بي إم دبليو': ['الفئة الثالثة', 'الفئة الخامسة', 'الفئة السابعة', 'X5', 'X6', 'X3', 'X7', 'أخرى'],
    'أودي': ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8', 'A5', 'أخرى'],
    'فورد': ['تورس', 'موستانج', 'إكسبلورر', 'إكسبيدشن', 'إف 150', 'إيدج', 'فوكس', 'أخرى'],
    'شيفروليه': ['تاهو', 'سيلفرادو', 'كامارو', 'ماليبو', 'كابرس', 'ترافرس', 'كورفيت', 'أخرى'],
    'نيسان': ['باترول', 'ألتيما', 'ماكسيما', 'صني', 'إكس تريل', 'باثفايندر', 'نافارا', 'أخرى'],
    'هيونداي': ['إلنترا', 'سوناتا', 'أكسنت', 'سانتا في', 'توسان', 'أزيرا', 'كريتا', 'أخرى'],
    'كيا': ['أوبتيما', 'سيراتو', 'سبورتج', 'سورينتو', 'ريو', 'K5', 'كادينزا', 'ستنجر', 'أخرى'],
    'لكزس': ['LS', 'LX', 'RX', 'ES', 'IS', 'GX', 'NX', 'أخرى'],
    'جيب': ['جراند شيروكي', 'روبيكون', 'رولنجر', 'شيروكي', 'كومباس', 'أخرى']
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = isPaid ? 6 : 2;
    if (files.length + images.length > maxImages) {
      setError(`يمكنك رفع ${maxImages} صور فقط للإعلان ${isPaid ? 'المدفوع' : 'المجاني'}`);
      return;
    }
    setImages([...images, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...previews]);
  };

  // ============================================================
  // 🔧 دالة جديدة لرفع الصور إلى Vercel Blob
  // ============================================================
  const uploadImagesToBlob = async (files: File[], carId: number): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('carId', carId.toString());

      const response = await fetch('/api/cars', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`فشل رفع الصورة: ${file.name}`);
      }

      const data = await response.json();
      if (data.success && data.url) {
        uploadedUrls.push(data.url);
      } else {
        throw new Error(`فشل رفع الصورة: ${file.name}`);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.brand || !formData.model || !formData.price) {
        setError('الماركة، الموديل، والسعر مطلوبة');
        setLoading(false);
        return;
      }

      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      if (!userId) {
        setError('يجب تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      const userIdNumber = parseInt(userId);
      if (isNaN(userIdNumber)) {
        setError('معرف المستخدم غير صحيح يرجى إعادة تسجيل الدخول');
        setLoading(false);
        return;
      }

      // ============================================================
      // 1. إنشاء الإعلان أولاً في قاعدة البيانات (بدون صور)
      // ============================================================
      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year.toString()) || null,
        price: parseFloat(formData.price),
        kilometers: formData.kilometers ? parseFloat(formData.kilometers) : null,
        color: formData.color || null,
        description: formData.description || null,
        images: [], // سيتم تحديثه لاحقاً
        user_id: userIdNumber,
        payment_method: formData.payment_method || 'western_union',
        is_featured: isPaid,
        featured_price: isPaid ? parseFloat(formData.price) * 0.1 : null,
        currency: formData.currency || 'KWD',
      };

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        if (response.ok || responseText.includes('success')) {
          data = { success: true };
        } else {
          data = { success: false, message: responseText };
        }
      }

      if (!data.success) {
        setError(data.message || 'فشل نشر الإعلان');
        setLoading(false);
        return;
      }

      // ============================================================
      // 2. رفع الصور إلى Vercel Blob
      // ============================================================
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploadingImages(true);
        try {
          const carId = data.id || data.carId;
          if (!carId) {
            throw new Error('لم يتم العثور على معرف السيارة');
          }
          imageUrls = await uploadImagesToBlob(images, carId);
        } catch (uploadError: any) {
          setError(`تم نشر الإعلان لكن فشل رفع الصور: ${uploadError.message}`);
          setUploadingImages(false);
          setLoading(false);
          return;
        }
        setUploadingImages(false);
      }

      // ============================================================
      // 3. تحديث الإعلان بروابط الصور من Vercel Blob
      // ============================================================
      if (imageUrls.length > 0) {
        const updateResponse = await fetch('/api/cars', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.id || data.carId,
            images: imageUrls,
          }),
        });

        if (!updateResponse.ok) {
          console.warn('تم نشر الإعلان لكن فشل تحديث روابط الصور');
        }
      }

      setSuccess('تم نشر الإعلان بنجاح!');
      setFormData({
        brand: '', model: '', year: new Date().getFullYear(),
        price: '', kilometers: '', color: '', description: '',
        payment_method: 'western_union', currency: 'KWD',
      });
      setImages([]);
      setImagePreview([]);
      setIsPaid(false);
      setTimeout(() => { router.push('/'); }, 2000);

    } catch (err: any) {
      setError('حدث خطأ غير متوقع أثناء عملية النشر');
      console.error(err);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const styIn = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginTop: '5px',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button type="button" onClick={() => router.push('/')} style={{ marginBottom: '15px', padding: '8px 12px', border: 'none', backgroundColor: '#334155', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
        ← العودة للرئيسية
      </button>

      <h1 style={{ textAlign: 'center', fontSize: '20px', marginBottom: '20px' }}>📢 نشر إعلان جديد</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>❌ {error}</div>}
      {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>✅ {success}</div>}
      {uploadingImages && <div style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>⏳ جاري رفع الصور...</div>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الماركة *</label>
          <select required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })} style={styIn}>
            <option value="">اختر الماركة</option>
            {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الموديل *</label>
          <select required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={styIn} disabled={!formData.brand}>
            <option value="">{formData.brand ? 'اختر الموديل' : 'يرجى اختيار الماركة أولاً'}</option>
            {formData.brand && (modelsMap[formData.brand] || ['أخرى']).map(model => <option key={model} value={model}>{model}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السنة</label>
          <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} style={styIn}>
            {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السعر *</label>
          <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={styIn} placeholder="السعر" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>💰 العملة</label>
          <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} style={styIn}>
            {currencies.map(curr => <option key={curr.code} value={curr.code}>{curr.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الكيلومترات</label>
          <input type="number" min="0" value={formData.kilometers} onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })} style={styIn} placeholder="المسافة" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>اللون</label>
          <select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} style={styIn}>
            <option value="">اختر اللون</option>
            {colors.map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px', border: '1px dashed #f59e0b', padding: '12px', borderRadius: '8px' }}>
          <input type="checkbox" id="paid-ad" checked={isPaid} onChange={(e) => { setIsPaid(e.target.checked); setImages([]); setImagePreview([]); }} />
          <label htmlFor="paid-ad" style={{ fontWeight: 'bold' }}>👑 إعلان مدفوع</label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>📸 صور السيارة</label>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={styIn} />
          {imagePreview.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {imagePreview.map((preview, index) => (
                <img key={index} src={preview} alt={`صورة ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>وصف إضافي</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...styIn, height: '80px', resize: 'none' }} />
        </div>

        <button type="submit" disabled={loading || uploadingImages} style={{ width: '100%', padding: '12px', backgroundColor: (loading || uploadingImages) ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold' }}>
          {loading ? 'جاري النشر...' : uploadingImages ? 'جاري رفع الصور...' : '🚙 نشر الإعلان'}
        </button>
      </form>
    </div>
  );
}
