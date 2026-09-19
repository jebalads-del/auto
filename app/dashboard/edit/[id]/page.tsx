'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const currencies = [
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي' },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي' },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي' },
  { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري' },
  { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني' },
  { code: 'OMR', symbol: 'ر.ع', name: 'ريال عماني' },
];

const BRANDS = [
  'تويوتا', 'هوندا', 'مرسيدس', 'بي إم دبليو', 'أودي',
  'فولكس واجن', 'فورد', 'شيفروليه', 'نيسان', 'هيونداي',
  'كيا', 'مازدا', 'لكزس', 'جيب', 'رينو', 'بيجو',
  'سيات', 'ميتسوبيشي', 'سوبارو', 'فولفو', 'جاغوار',
  'لاند روفر', 'بورش', 'فيات', 'ألفا روميو', 'أخرى'
];

const MODELS: Record<string, string[]> = {
  'تويوتا': ['كامري', 'كورولا', 'لاندكروزر', 'برادو', 'أفالون', 'راف فور', 'يارس', 'هيلوكس', 'هايلوكس', 'فورتشنر', 'أخرى'],
  'هوندا': ['أكورد', 'سيفيك', 'سي آر في', 'بايلوت', 'أوديسي', 'سيتي', 'HR-V', 'أخرى'],
  'مرسيدس': ['الفئة C', 'الفئة E', 'الفئة S', 'GLC', 'GLE', 'G-Class', 'CLA', 'A-Class', 'AMG GT', 'أخرى'],
  'بي إم دبليو': ['الفئة الثالثة', 'الفئة الخامسة', 'الفئة السابعة', 'X5', 'X6', 'X3', 'X7', 'X1', 'Z4', 'أخرى'],
  'أودي': ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8', 'A5', 'A3', 'Q3', 'RS6', 'أخرى'],
  'فولكس واجن': ['جولف', 'باسات', 'تويج', 'طوارق', 'أطلس', 'بيتل', 'أخرى'],
  'فورد': ['تورس', 'موستانج', 'إكسبلورر', 'إكسبيدشن', 'إف 150', 'إيدج', 'فوكس', 'فيوجن', 'أخرى'],
  'شيفروليه': ['تاهو', 'سيلفرادو', 'كامارو', 'ماليبو', 'كابرس', 'ترافرس', 'كورفيت', 'أخرى'],
  'نيسان': ['باترول', 'ألتيما', 'ماكسيما', 'صني', 'إكس تريل', 'باثفايندر', 'نافارا', 'سفاري', 'أخرى'],
  'هيونداي': ['إلنترا', 'سوناتا', 'أكسنت', 'سانتا في', 'توسان', 'أزيرا', 'كريتا', 'باليسايد', 'أخرى'],
  'كيا': ['أوبتيما', 'سيراتو', 'سبورتج', 'سورينتو', 'ريو', 'K5', 'كادينزا', 'ستنجر', 'أخرى'],
  'مازدا': ['مازدا 3', 'مازدا 6', 'CX-5', 'CX-9', 'MX-5', 'أخرى'],
  'لكزس': ['LS', 'LX', 'RX', 'ES', 'IS', 'GX', 'NX', 'UX', 'LC', 'أخرى'],
  'جيب': ['جراند شيروكي', 'روبيكون', 'رولنجر', 'شيروكي', 'كومباس', 'رينيجيد', 'أخرى'],
  'رينو': ['لوجان', 'سانديرو', 'ميجان', 'كابتشر', 'داستر', 'كوليو', 'أخرى'],
  'بيجو': ['208', '301', '308', '408', '508', '2008', '3008', '5008', 'بارتنر', 'أخرى'],
  'سيات': ['إيبيزا', 'ليون', 'طليعة', 'أرونا', 'أتيكا', 'أخرى'],
  'ميتسوبيشي': ['لانسر', 'باجيرو', 'آوتلاندر', 'ASX', 'إكليبس', 'أخرى'],
  'سوبارو': ['إمبريزا', 'أوت باك', 'فورستر', 'ليغاسي', 'XV', 'WRX', 'أخرى'],
  'فولفو': ['S60', 'S90', 'XC40', 'XC60', 'XC90', 'V60', 'أخرى'],
  'جاغوار': ['XE', 'XF', 'XJ', 'F-PACE', 'E-PACE', 'I-PACE', 'أخرى'],
  'لاند روفر': ['رينج روفر', 'سبورت', 'فيلار', 'ديسكفري', 'ديفندر', 'أخرى'],
  'بورش': ['كايين', 'ماكان', 'باناميرا', 'تاي كان', '911', 'بوكستر', 'أخرى'],
  'فيات': ['500', 'باندا', 'تيبو', 'دوبلو', 'أخرى'],
  'ألفا روميو': ['جوليا', 'ستيلفيو', 'جوليتا', 'أخرى'],
  'أخرى': ['أخرى']
};

const COLORS = ['أسود', 'أبيض', 'أحمر', 'أزرق', 'رمادي', 'فضي', 'ذهبي', 'بني', 'أخضر', 'أصفر', 'برتقالي', 'أرجواني', 'وردي', 'بيج', 'نحاسي'];

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    kilometers: '',
    color: '',
    description: '',
    currency: 'KWD',
  });

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/cars/${id}`);
        if (!res.ok) throw new Error('فشل جلب بيانات السيارة');
        const data = await res.json();
        const targetAd = Array.isArray(data) ? data[0] : data.car || data.data || data;

        if (targetAd) {
          setFormData({
            brand: targetAd.brand || '',
            model: targetAd.model || '',
            year: targetAd.year || new Date().getFullYear(),
            price: targetAd.price ? targetAd.price.toString() : '',
            kilometers: targetAd.kilometers ? targetAd.kilometers.toString() : '',
            color: targetAd.color || '',
            description: targetAd.description || '',
            currency: targetAd.currency || 'KWD',
          });

          // معالجة مصفوفة الصور
          let imgs: string[] = [];
          if (Array.isArray(targetAd.images)) {
            imgs = targetAd.images;
          } else if (typeof targetAd.images === 'string') {
            try {
              imgs = JSON.parse(targetAd.images);
            } catch {
              imgs = targetAd.images.split(',').map((u: string) => u.trim()).filter(Boolean);
            }
          }
          setExistingImages(imgs);
        }
      } catch (err) {
        console.error('❌ خطأ في جلب تفاصيل الإعلان:', err);
        setError('تعذر تحميل بيانات الإعلان');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 4;
    const totalCurrent = existingImages.length + newImages.length;

    if (files.length + totalCurrent > maxImages) {
      setError(`يمكنك إضافة ${maxImages} صور كحد أقصى بالإجمالي`);
      return;
    }

    setNewImages([...newImages, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...previews]);
  };

  const removeExistingImage = (index: number) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    setExistingImages(updated);
  };

  const removeNewImage = (index: number) => {
    const updatedFiles = [...newImages];
    updatedFiles.splice(index, 1);
    setNewImages(updatedFiles);

    const updatedPreviews = [...newImagePreviews];
    updatedPreviews.splice(index, 1);
    setNewImagePreviews(updatedPreviews);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!formData.brand || !formData.model || !formData.price) {
        setError('الماركة والموديل والسعر حقول مطلوبة');
        setSaving(false);
        return;
      }

      // رفع الصور الجديدة إن وجدت
      const uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        for (const file of newImages) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `cars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, file, { contentType: file.type });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('car-images').getPublicUrl(filePath);
            if (urlData?.publicUrl) uploadedUrls.push(urlData.publicUrl);
          }
        }
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year.toString()) || null,
        price: parseFloat(formData.price),
        kilometers: formData.kilometers ? parseFloat(formData.kilometers) : null,
        color: formData.color || null,
        description: formData.description || null,
        currency: formData.currency,
        images: finalImages,
      };

      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && (result.success || result.data || result.id)) {
        alert('✅ تم حفظ التعديلات بنجاح!');
        router.push('/dashboard/cars');
      } else {
        setError(result.message || 'حدث خطأ أثناء حفظ التعديلات');
      }
    } catch (err) {
      setError('فشل الاتصال بالسيرفر أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const styIn = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    marginTop: '6px',
    boxSizing: 'border-box' as const,
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
  };

  if (loading) {
    return (
      <div style={{ direction: 'rtl', padding: '40px 20px', textAlign: 'center' }}>
        <p>⏳ جاري تحميل بيانات الإعلان...</p>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* شريط علوي وزر الإغلاق */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold', color: '#1e293b' }}>✏️ تعديل بيانات الإعلان (#{id})</h1>
        <button
          onClick={() => router.back()}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="إغلاق"
        >
          ✕
        </button>
      </div>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '10px', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>❌ {error}</div>}

      <form onSubmit={handleUpdate} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>الماركة *</label>
          <select required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })} style={styIn}>
            <option value="">اختر الماركة</option>
            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>الموديل *</label>
          <select required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={styIn} disabled={!formData.brand}>
            <option value="">{formData.brand ? 'اختر الموديل' : 'اختر الماركة أولاً'}</option>
            {formData.brand && (MODELS[formData.brand] || []).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>السعر *</label>
            <input type="number" required placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={styIn} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>العملة</label>
            <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} style={styIn}>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>سنة الصنع</label>
            <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} style={styIn}>
              {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>اللون</label>
            <select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} style={styIn}>
              <option value="">اختر اللون</option>
              {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>المسافة المقطوعة (كيلومترات)</label>
          <input type="number" placeholder="مثال: 50000" value={formData.kilometers} onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })} style={styIn} />
        </div>

        {/* عرض وإدارة الصور */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
            صور السيارة (حتى 4 صور)
          </label>

          {/* الصور الموجودة سابقاً */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px 0' }}>الصور الحالية:</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {existingImages.map((imgUrl, i) => (
                  <div key={i} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={imgUrl} alt="existing car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(220, 38, 38, 0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* رفع صور جديدة */}
          <div style={{ border: '2px dashed #cbd5e1', padding: '14px', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <input type="file" id="edit-file-input" multiple accept="image/*" onChange={handleNewImageUpload} style={{ display: 'none' }} />
            <label htmlFor="edit-file-input" style={{ cursor: 'pointer', display: 'block' }}>
              <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold' }}>➕ إضافة صور جديدة</span>
            </label>
          </div>

          {newImagePreviews.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {newImagePreviews.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <img src={p} alt="new car preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(220, 38, 38, 0.85)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>الوصف</label>
          <textarea
            placeholder="تعديل تفاصيل السيارة..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ ...styIn, height: '90px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{ flex: 1, padding: '12px', backgroundColor: saving ? '#94a3b8' : '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات'}
          </button>
          <Link
            href="/dashboard/cars"
            style={{ padding: '12px 20px', backgroundColor: '#64748b', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
