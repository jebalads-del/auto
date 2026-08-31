'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

// الـ User ID الخاص بالادمن
const MY_USER_ID = '2bee03ee-4e4e-464a-8bd9-56f15a056432';

export default function NewCarPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          localStorage.setItem('userId', session.user.id);
        } else {
          const savedUserId = localStorage.getItem('userId');
          if (savedUserId) {
            setUserId(savedUserId);
          } else {
            setUserId(MY_USER_ID);
            localStorage.setItem('userId', MY_USER_ID);
          }
        }
      } catch (err) {
        console.error('Error getting user:', err);
        setUserId(MY_USER_ID);
        localStorage.setItem('userId', MY_USER_ID);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    getUser();
  }, [supabase.auth]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 4;

    if (files.length + images.length > maxImages) {
      setError(`يمكنك رفع ${maxImages} صور فقط`);
      return;
    }

    setImages([...images, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!userId) {
        setError('يجب تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      if (!formData.brand || !formData.model || !formData.price) {
        setError('الماركة، الموديل، والسعر مطلوبة');
        setLoading(false);
        return;
      }

      // 1. إنشاء الإعلان
      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year.toString()) || null,
        price: parseFloat(formData.price),
        kilometers: formData.kilometers ? parseFloat(formData.kilometers) : null,
        color: formData.color || null,
        description: formData.description || null,
        images: [],
        user_id: userId,
        currency: formData.currency || 'KWD',
        status: 'pending',
      };

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'فشل نشر الإعلان');
        setLoading(false);
        return;
      }

      const carId = data.data?.[0]?.id || data.id;

      // 2. رفع الصور إلى Supabase Storage
      if (images.length > 0 && carId) {
        try {
          const uploadedUrls = [];

          for (const file of images) {
            // إنشاء اسم فريد للصورة
            const fileExt = file.name.split('.').pop();
            const fileName = `${carId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `cars/${fileName}`;

            console.log('📤 جاري رفع الصورة:', fileName);

            // رفع الصورة إلى Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('car-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type,
              });

            if (uploadError) {
              console.error('❌ فشل رفع الصورة:', uploadError);
              continue;
            }

            console.log('✅ تم رفع الصورة:', uploadData);

            // الحصول على الرابط العام للصورة
            const { data: urlData } = supabase.storage
              .from('car-images')
              .getPublicUrl(filePath);

            if (urlData?.publicUrl) {
              uploadedUrls.push(urlData.publicUrl);
              console.log('🔗 رابط الصورة:', urlData.publicUrl);
            }
          }

          // 3. تحديث الإعلان بروابط الصور
          if (uploadedUrls.length > 0) {
            const { error: updateError } = await supabase
              .from('cars')
              .update({ images: uploadedUrls })
              .eq('id', carId);

            if (updateError) {
              console.error('❌ فشل تحديث الصور:', updateError);
              setSuccess('⚠️ تم نشر الإعلان لكن فشل حفظ الصور');
            } else {
              setSuccess('✅ تم نشر الإعلان مع الصور بنجاح!');
            }
          } else {
            setSuccess('⚠️ تم نشر الإعلان لكن فشل رفع الصور');
          }
        } catch (error) {
          console.error('❌ خطأ في رفع الصور:', error);
          setSuccess('⚠️ تم نشر الإعلان لكن حدث خطأ في رفع الصور');
        }
      } else {
        setSuccess('✅ تم نشر الإعلان بنجاح!');
      }

      // إعادة تعيين النموذج
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        kilometers: '',
        color: '',
        description: '',
        currency: 'KWD',
      });
      setImages([]);
      setImagePreviews([]);

      setTimeout(() => { router.push('/'); }, 2000);

    } catch (err: any) {
      setError('حدث خطأ غير متوقع');
      console.error(err);
    } finally {
      setLoading(false);
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

  if (isCheckingAuth) {
    return (
      <div style={{ direction: 'rtl', padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <p>⏳ جاري التحقق من الجلسة...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div style={{ direction: 'rtl', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h2>⚠️ يجب تسجيل الدخول أولاً</h2>
          <p style={{ marginTop: '10px' }}>للوصول إلى هذه الصفحة، يرجى تسجيل الدخول.</p>
          <button 
            onClick={() => router.push('/login')}
            style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => router.push('/')} style={{ marginBottom: '15px', padding: '8px 12px', border: 'none', backgroundColor: '#334155', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
        ← العودة للرئيسية
      </button>

      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>📢 إضافة إعلان سيارة جديدة</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>❌ {error}</div>}
      {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>✅ {success}</div>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>الماركة *</label>
          <select required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })} style={styIn}>
            <option value="">اختر الماركة</option>
            {BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>الموديل *</label>
          <select required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={styIn} disabled={!formData.brand}>
            <option value="">{formData.brand ? 'اختر الموديل' : 'يرجى اختيار الماركة أولاً'}</option>
            {formData.brand && (MODELS[formData.brand] || ['أخرى']).map(model => <option key={model} value={model}>{model}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>السعر *</label>
          <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={styIn} placeholder="مثال: 5000" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>💰 العملة</label>
          <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} style={styIn}>
            {currencies.map(curr => <option key={curr.code} value={curr.code}>{curr.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>سنة الصنع</label>
          <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} style={styIn}>
            {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>الممشي (كم)</label>
          <input type="number" min="0" value={formData.kilometers} onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })} style={styIn} placeholder="مثال: 50000" />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>اللون</label>
          <select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} style={styIn}>
            <option value="">اختر اللون</option>
            {COLORS.map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px', border: '2px dashed #2563eb', padding: '15px', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>📸 صور السيارة (حد أقصى 4)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={styIn}
          />

          {imagePreviews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img src={preview} alt={`صورة ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
            {images.length}/4 صور تم اختيارها
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>وصف الإعلان</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...styIn, height: '80px', resize: 'none' }} placeholder="اكتب وصفاً مفصلاً للسيارة..." />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? '⏳ جاري النشر...' : '🚙 نشر الإعلان'}
        </button>
      </form>
    </div>
  );
}
