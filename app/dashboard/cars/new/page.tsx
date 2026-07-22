'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    brand: '',        // ✅ الماركة
    model: '',
    year: new Date().getFullYear(),
    price: '',
    kilometers: '',   // ✅ الممشى
    color: '',
    description: '',
    payment_method: 'western_union',
    is_featured: false,
    featured_price: '',
    currency: 'USD',
  });

  // قوائم الماركات والموديلات
  const brands = ['تويوتا', 'هوندا', 'مرسيدس', 'بي إم دبليو', 'أودي', 'فولكس واجن', 'فورد', 'شيفروليه', 'نيسان', 'هيونداي', 'كيا', 'مازدا', 'لكزس', 'جيب', 'رينو', 'بيجو', 'سيات', 'ميتسوبيشي', 'سوبارو', 'فولفو'];
  
  const colors = ['أسود', 'أبيض', 'أحمر', 'أزرق', 'رمادي', 'فضي', 'ذهبي', 'بني', 'أخضر', 'أصفر', 'برتقالي', 'أرجواني', 'وردي'];

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

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreview(imagePreview.filter((_, i) => i !== index));
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

      const userId = localStorage.getItem('userId') || '1';

      // تحويل الصور إلى Base64
      const imageBase64 = await Promise.all(
        images.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year.toString()) || null,
        price: parseFloat(formData.price),
        kilometers: formData.kilometers ? parseFloat(formData.kilometers) : null,
        color: formData.color || null,
        description: formData.description || null,
        images: imageBase64,
        user_id: parseInt(userId),
        payment_method: formData.payment_method || 'western_union',
        is_featured: isPaid,
        featured_price: isPaid ? parseFloat(formData.price) * 0.1 : null,
        currency: 'USD',
      };

      console.log('جاري إرسال:', payload);

      const response = await fetch('/api/admin/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('✅ تم إرسال الإعلان للمراجعة بنجاح!');
        setTimeout(() => {
          router.push('/dashboard/cars');
        }, 2000);
      } else {
        setError(data.message || 'حدث خطأ أثناء نشر الإعلان');
      }
    } catch (error) {
      console.error('خطأ:', error);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const styIn = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "12px",
    boxSizing: "border-box" as const
  };

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '15px' }}>
      
      {/* الهيدر */}
      <header style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '12px', marginBottom: '20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '18px' }}>🚗 سيارتي</h1>
          <Link href="/" style={{ backgroundColor: '#475569', color: 'white', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px' }}>
            ← العودة للرئيسية
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>🚗 نشر إعلان جديد</h1>

        {error && (
          <div style={{ backgroundColor: '#fee', color: '#c33', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          
          {/* الماركة - قائمة منسدلة */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الماركة *</label>
            <select
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              style={styIn}
            >
              <option value="">اختر الماركة</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* الموديل */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الموديل *</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              style={styIn}
              placeholder="مثل: كامري، أكورد، الفئة S"
              list="models"
            />
            <datalist id="models">
              <option value="كامري" />
              <option value="أكورد" />
              <option value="الفئة S" />
              <option value="X5" />
              <option value="Q7" />
              <option value="فوكس" />
              <option value="موستانج" />
            </datalist>
          </div>

          {/* السنة */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السنة</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              style={styIn}
            >
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* السعر */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السعر ($) *</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              style={styIn}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          {/* الممشى */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الممشى (كم)</label>
            <input
              type="number"
              value={formData.kilometers}
              onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
              style={styIn}
              placeholder="0"
              min="0"
            />
          </div>

          {/* اللون - قائمة منسدلة */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>اللون</label>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              style={styIn}
            >
              <option value="">اختر اللون</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* خيار الإعلان المدفوع */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
              <span style={{ fontWeight: 'bold' }}>💰 إعلان مدفوع (اختياري)</span>
            </label>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>
              {isPaid ? '📸 يمكنك رفع 6 صور للسيارة' : '📸 يمكنك رفع 2 صور للسيارة (مجاني)'}
            </p>
          </div>

          {/* رفع الصور */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📸 صور السيارة ({isPaid ? '6' : '2'} صور كحد أقصى)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={styIn}
              disabled={images.length >= (isPaid ? 6 : 2)}
            />
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {imagePreview.map((src, index) => (
                <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={src} alt={`صورة ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* طريقة الدفع (تظهر فقط للإعلان المدفوع) */}
          {isPaid && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>طريقة الدفع</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                style={styIn}
              >
                <option value="western_union">💵 ويسترن يونيون</option>
                <option value="paypal">💳 باي بال</option>
              </select>
            </div>
          )}

          {/* وصف إضافي */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>وصف إضافي</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...styIn, minHeight: '80px' }}
              placeholder="أي تفاصيل إضافية عن السيارة..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'جاري النشر...' : '📤 نشر الإعلان'}
          </button>
        </form>
      </div>
    </div>
  );
}
