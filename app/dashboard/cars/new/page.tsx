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
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');

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
          const id = session.user.id;
          if (id && id.length > 10 && id.includes('-')) {
            setUserId(id);
            localStorage.setItem('userId', id);

            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('id', id)
              .single();

            if (userData?.role) setUserRole(userData.role);

            setIsCheckingAuth(false);
            return;
          }
        }

        const savedUserId = localStorage.getItem('userId');
        if (savedUserId && savedUserId.length > 10 && savedUserId.includes('-')) {
          setUserId(savedUserId);

          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', savedUserId)
            .single();

          if (userData?.role) setUserRole(userData.role);

          setIsCheckingAuth(false);
          return;
        }

        setUserId(MY_USER_ID);
        localStorage.setItem('userId', MY_USER_ID);
      } catch (err) {
        console.error('❌ Error getting user:', err);
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

      // ✅ التحقق من الموافقة على الشروط
      if (!agreeToTerms) {
        setError('يجب الموافقة على الشروط والأحكام قبل النشر');
        setLoading(false);
        return;
      }

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
        // ✅ حفظ الموافقة على الشروط
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_version: 'v1.0',
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

      if (images.length > 0 && carId) {
        const uploadedUrls = [];

        for (const file of images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${carId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `cars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type,
            });

          if (uploadError) continue;

          const { data: urlData } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) uploadedUrls.push(urlData.publicUrl);
        }

        if (uploadedUrls.length > 0) {
          await supabase
            .from('cars')
            .update({ images: uploadedUrls })
            .eq('id', carId);
        }
      }

      setSuccess('✅ تم نشر الإعلان بنجاح!');

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
      setAgreeToTerms(false); // ✅ إعادة تعيين الموافقة
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      setError('حدث خطأ غير متوقع');
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
      <div style={{ direction: 'rtl', padding: '20px', textAlign: 'center' }}>
        <p>⏳ جاري التحقق من الجلسة...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div style={{ direction: 'rtl', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fee2e2', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h2>⚠️ يجب تسجيل الدخول أولاً</h2>
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

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>

      {/* ✅ أزرار التنقل */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push('/')}
          style={{ flex: 1, minWidth: '100px', padding: '10px 14px', border: 'none', backgroundColor: '#334155', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
        >
          🏠 الرئيسية
        </button>

        {isAdmin ? (
          <button
            onClick={() => router.push('/dashboard')}
            style={{ flex: 1, minWidth: '100px', padding: '10px 14px', border: 'none', backgroundColor: '#7c3aed', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            ⚙️ لوحة الإدارة
          </button>
        ) : (
          <button
            onClick={() => router.push('/profile')}
            style={{ flex: 1, minWidth: '100px', padding: '10px 14px', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            👤 ملفي الشخصي
          </button>
        )}
      </div>

      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>📢 إضافة إعلان سيارة جديدة</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>❌ {error}</div>}
      {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>✅ {success}</div>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px' }}>

        <label>الماركة *</label>
        <select required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })} style={styIn}>
          <option value="">اختر الماركة</option>
          {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <label style={{ marginTop: '10px', display: 'block' }}>الموديل *</label>
        <select required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={styIn} disabled={!formData.brand}>
          <option value="">{formData.brand ? 'اختر الموديل' : 'اختر الماركة أولاً'}</option>
          {formData.brand && (MODELS[formData.brand] || []).map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <label style={{ marginTop: '10px', display: 'block' }}>السعر *</label>
        <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={styIn} />

        <label style={{ marginTop: '10px', display: 'block' }}>سنة الصنع</label>
        <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} style={styIn}>
          {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 1 - i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <label style={{ marginTop: '10px', display: 'block' }}>اللون</label>
        <select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} style={styIn}>
          <option value="">اختر اللون</option>
          {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={{ marginTop: '10px', display: 'block' }}>صور السيارة</label>
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={styIn} />

        {imagePreviews.map((p, i) => <img key={i} src={p} style={{ width: 70, margin: 4 }} />)}

        <label style={{ marginTop: '10px', display: 'block' }}>الوصف</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ ...styIn, height: 80 }} />

        {/* ⚠️ قسم الشروط والأحكام */}
        <div style={{ 
          backgroundColor: '#fef2f2', 
          padding: '18px', 
          borderRadius: '12px', 
          border: '2px solid #ef4444',
          marginBottom: '20px',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '12px',
            paddingBottom: '10px',
            borderBottom: '1px solid #fecaca',
          }}>
            <span style={{ fontSize: '22px' }}>📜</span>
            <h3 style={{ 
              fontSize: '15px', 
              fontWeight: 'bold', 
              color: '#dc2626', 
              margin: 0,
            }}>
              الشروط والأحكام
            </h3>
          </div>

          <div style={{ 
            fontSize: '12.5px', 
            color: '#7f1d1d', 
            lineHeight: '1.8', 
            marginBottom: '15px',
            backgroundColor: '#ffffff',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #fecaca',
          }}>
            <p style={{ margin: '0 0 10px', fontWeight: 'bold', color: '#991b1b' }}>
              🚫 يُمنع منعاً باتاً:
            </p>
            <ul style={{ paddingRight: '20px', margin: '0 0 12px' }}>
              <li>نقل الإعلانات من مواقع أخرى (Haraj، OLX، 4Sale، إلخ)</li>
              <li>نشر معلومات مضللة أو صور غير حقيقية</li>
              <li>استخدام صور لا تملك حقوقها</li>
              <li>نشر إعلانات مكررة لنفس السيارة</li>
              <li>انتحال شخصية البائع الحقيقي</li>
            </ul>

            <p style={{ margin: '0 0 10px', fontWeight: 'bold', color: '#991b1b' }}>
              ✅ أقر وأتعهد بما يلي:
            </p>
            <ul style={{ paddingRight: '20px', margin: 0 }}>
              <li>أن الإعلان خاص بي وليس منقولاً من أي موقع آخر</li>
              <li>أن جميع المعلومات والصور المرفقة مملوكة لي</li>
              <li>أنني المسؤول الكامل عن صحة المعلومات المذكورة</li>
              <li>أنني لن أنشر إعلانات مكررة أو مضللة</li>
              <li>أنني أتحمل كامل المسؤولية القانونية عن الإعلان</li>
            </ul>
          </div>

          <div style={{ 
            fontSize: '11.5px', 
            color: '#7f1d1d', 
            lineHeight: '1.7', 
            marginBottom: '15px',
            fontWeight: 'bold',
            backgroundColor: '#fee2e2',
            padding: '10px 12px',
            borderRadius: '8px',
          }}>
            ⚠️ منصة سيارتي غير مسؤولة عن أي إعلانات منقولة أو منتحلة، وتحتفظ بحق حذف أي إعلان دون إشعار مسبق وفي أي وقت.
          </div>

          <label 
            htmlFor="agree-terms" 
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '10px',
              cursor: 'pointer',
              backgroundColor: agreeToTerms ? '#f0fdf4' : '#ffffff',
              padding: '12px',
              borderRadius: '10px',
              border: agreeToTerms ? '2px solid #16a34a' : '2px solid #cbd5e1',
              transition: 'all 0.2s',
            }}
          >
            <input 
              type="checkbox" 
              id="agree-terms" 
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              style={{ 
                marginTop: '3px', 
                width: '20px', 
                height: '20px', 
                cursor: 'pointer', 
                flexShrink: 0,
                accentColor: '#16a34a',
              }} 
            />
            <span style={{ 
              fontSize: '13px', 
              color: agreeToTerms ? '#166534' : '#475569', 
              lineHeight: '1.6', 
              fontWeight: 'bold',
            }}>
              {agreeToTerms ? '✅ ' : ''}
              أوافق على جميع الشروط والأحكام، وأتعهد بأن الإعلان خاص بي وليس منقولاً، وأتحمل كامل المسؤولية القانونية عن صحته.
            </span>
          </label>
        </div>

        {/* زر النشر */}
        <button 
          type="submit" 
          disabled={loading || !agreeToTerms}
          style={{ 
            width: '100%', 
            padding: '14px', 
            backgroundColor: loading || !agreeToTerms ? '#94a3b8' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            cursor: loading || !agreeToTerms ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: !agreeToTerms ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ جاري النشر...' : !agreeToTerms ? '⚠️ يجب الموافقة على الشروط أولاً' : '🚙 نشر الإعلان'}
        </button>
      </form>
    </div>
  );
}
