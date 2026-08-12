'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BRANDS = ['تويوتا', 'لكزس', 'نيسان', 'فورد', 'شيفروليه', 'جي إم سي', 'هيونداي', 'كيا', 'مرسيدس', 'بي إم دبليو', 'أودي', 'بورش', 'هوندا', 'مازدا', 'ميتسوبيشي', 'جيب', 'لاند روفر', 'أخرى'];
const CURRENCIES = [
  { code: 'KWD', label: 'دينار كويتي' },
  { code: 'SAR', label: 'ريال سعودي' },
  { code: 'AED', label: 'درهم إماراتي' },
  { code: 'QAR', label: 'ريال قطري' },
  { code: 'BHD', label: 'دينار بحريني' },
  { code: 'OMR', label: 'ريال عماني' }
];

export default function NewCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<any>({});
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    kilometers: '',
    color: '',
    description: '',
    currency: 'KWD'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(filesArray);
      if (errors.images) setErrors((prev: any) => ({ ...prev, images: '' }));
    }
  };

  const imageUpload = async (): Promise<string[]> => {
    try {
      const formDataFiles = new FormData();
      imageFiles.forEach(file => {
        formDataFiles.append('files', file);
      });

      const response = await fetch('/api/cars/upload', {
        method: 'POST',
        body: formDataFiles,
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.urls)) {
        return data.urls;
      } else if (data.url) {
        return [data.url];
      }
      return [];
    } catch (error) {
      console.error('Image upload failure:', error);
      return [];
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (imageFiles.length === 0) {
      setErrors({ images: 'يرجى اختيار صورة واحدة على الأقل لسيارتك' });
      setLoading(false);
      return;
    }

    try {
      // رفع الصور واستخراج الروابط السليمة من السيرفر
      const imageUrls = await imageUpload();
      if (!imageUrls || imageUrls.length === 0) {
        alert('فشل رفع الصور لـ Vercel Blob. يرجى التحقق من الشبكة وإعادة المحاولة.');
        setLoading(false);
        return;
      }

      // تجهيز البيانات المطابقة لقاعدة بيانات Neon
      const payload = {
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year) || 0,
        price: parseFloat(formData.price) || 0,
        kilometers: parseInt(formData.kilometers) || 0,
        color: formData.color,
        description: formData.description,
        status: 'pending',
        currency: formData.currency,
        images: imageUrls.join(','), // حفظ المصفوفة كنص مفصول بفاصلة ليعمل في الواجهة
      };

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.success) {
        alert('تم إرسال إعلانك بنجاح! سيظهر بالموقع فور موافقة الإدارة المعنية.');
        router.push('/');
      } else {
        alert(resData.message || 'فشل السيرفر في معالجة طلبك وحفظ الإعلان.');
      }
    } catch (error) {
      console.error(error);
      alert('خطأ فني غير متوقع في الاتصال بالشبكة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>➕ إضافة إعلان سيارة جديد</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>ماركة السيارة 🚗</label>
            <select name="brand" value={formData.brand} onChange={handleChange} required style={styles.select}>
              <option value="">اختر الماركة</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>موديل السيارة (الطراز) 🏷️</label>
            <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="مثال: Camry, Land Cruiser" required style={styles.input} />
          </div>
          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>سنة الصنع (الموديل) 📅</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="مثال: 2024" required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>المسافة المقطوعة (كم) 🛣️</label>
              <input type="number" name="kilometers" value={formData.kilometers} onChange={handleChange} placeholder="مثال: 50000" required style={styles.input} />
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.formGroup}>
              <label style={styles.label}>السعر المطلـوب 💰</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="السعر" required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>العملة 💵</label>
              <select name="currency" value={formData.currency} onChange={handleChange} style={styles.select}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>اللون الخارجي للسيارة 🎨</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="مثال: أبيض, أسود ميتاليك" required style={styles.input} />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>تفاصيل ووصف السيارة الإضافي 📝</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="اذكر حالة السيارة، المواصفات، الفحص..." rows={4} required style={styles.textarea}></textarea>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>تحميل صور السيارة (يمكنك اختيار عدة صور) 📸</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} style={styles.fileInput} />
            {errors.images && <p style={styles.errorText}>{errors.images}</p>}
          </div>

          <button type="submit" disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
            {loading ? 'جاري رفع الصور وحفظ البيانات...' : '🚀 نشر الإعلان مجاناً'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '30px 15px', fontFamily: 'sans-serif', direction: 'rtl' as const },
  card: { maxWidth: '650px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center' as const, fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '25px' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '18px' },
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#475569' },
  input: { padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  select: { padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#ffffff', outline: 'none' },
  textarea: { padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' as const, outline: 'none' },
  fileInput: { fontSize: '13px', color: '#64748b', marginTop: '5px' },
  btn: { backgroundColor: '#f59e0b', color: '#1e293b', padding: '14px', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', marginTop: '10px' },
  btnDisabled: { backgroundColor: '#cbd5e1', color: '#94a3b8', padding: '14px', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'not-allowed', marginTop: '10px' },
  errorText: { color: '#ef4444', fontSize: '12px', margin: '5px 0 0 0', fontWeight: 'bold' }
};
