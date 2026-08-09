'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// قاعدة بيانات الماركات والموديلات المدمجة ذكياً لتسهيل النشر على الجوال
const CAR_DATABASE: { [key: string]: string[] } = {
  'تويوتا': ['كامري', 'كورولا', 'لاندكروزر', 'يارس', 'راف فور', 'هيلوكس'],
  'نيسان': ['ألتيما', 'صني', 'باترول', 'باثفايندر', 'نافارا', 'إكس تريل'],
  'هيونداي': ['إلنترا', 'أكسنت', 'سوناتا', 'توسان', 'سانتا في', 'أزيرا'],
  'كيا': ['سيراتو', 'أوبتيما', 'سبورتج', 'ريو', 'سورينتو', 'بيجاس'],
  'هوندا': ['أكورد', 'سيفيك', 'سي آر في', 'سيتي', 'بايلوت'],
  'بي إم دبليو': ['الفئة الثالثة', 'الفئة الخامسة', 'الفئة السابعة', 'X5', 'X6', 'X3'],
  'مرسيدس': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'A-Class'],
  'أودي': ['A4', 'A6', 'Q5', 'Q7', 'A8'],
  'فورد': ['تورس', 'إكسبلورر', 'موستانج', 'إيدج', 'فليكس', 'إف 150'],
  'لكزس': ['ES', 'LS', 'LX570', 'RX', 'IS', 'GX'],
  'شيفورليه': ['تاهو', 'ماليبو', 'كابتيفا', 'سيلفرادو', 'ترافرس'],
  'جيب': ['جراند شيروكي', 'روبيكون', 'رانجلر', 'كومباس', 'شيروكي'],
  'مازدا': ['مازدا 6', 'مازدا 3', 'CX-5', 'CX-9', 'CX-30']
};

export default function NewCarAd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    kilometers: '',
    color: '',
    description: ''
  });

  const uniqueBrands = Object.keys(CAR_DATABASE);
  const availableModels = formData.brand ? CAR_DATABASE[formData.brand] : [];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.brand || !formData.model || !formData.price) {
        setError('يرجى اختيار الماركة والموديل وتحديد السعر الإجباري');
        setLoading(false);
        return;
      }

      // تجهيز كائن البيانات الموحد الشامل لكافة الملفات والنصوص معاً
      const dataToSend = new FormData();
      dataToSend.append('brand', formData.brand);
      dataToSend.append('model', formData.model);
      dataToSend.append('year', formData.year);
      dataToSend.append('price', formData.price);
      dataToSend.append('kilometers', formData.kilometers);
      dataToSend.append('color', formData.color);
      dataToSend.append('description', formData.description);
      dataToSend.append('user_id', localStorage.getItem('userId') || localStorage.getItem('user_id') || '1');
      dataToSend.append('payment_method', 'cash');

      if (images.length > 0) {
        dataToSend.append('image', images[0]);
      }

      // إرسال الضربة الواحدة الموحدة التي حطمت أخطاء المعرفات والكاش
      const response = await fetch('/api/cars', {
        method: 'POST',
        body: dataToSend,
      });

      const data = await response.json().catch(() => null);

      if (!data || !data.success) {
        setError(data?.error || data?.message || 'فشل السيرفر في معالجة ورفع الإعلان');
        setLoading(false);
        return;
      }

      setSuccess('🎉 مبروك! تم رفع مواصفات السيارة المجهزة بالقوائم وصورتها الحية بنجاح إلى قاعدة البيانات، بانتظار تفعيل الأدمن ميكانيكياً!');
      setFormData({ brand: '', model: '', year: '', price: '', kilometers: '', color: '', description: '' });
      setImages([]);

    } catch (globalError: any) {
      setError(`حدث خطأ أثناء معالجة الإعلان: ${globalError.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <Link href="/dashboard" style={{ display: 'inline-block', marginBottom: '15px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>← العودة للوحة التحكم</Link>
        <h1 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>➕ إضافة إعلان سيارة جديدة</h1>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>❌ {error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }}>✅ {success}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* قائمة اختيار الماركة */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>الماركة *</label>
            <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '13px' }} required>
              <option value="">اختر ماركة السيارة...</option>
              {uniqueBrands.map((brand, idx) => <option key={idx} value={brand}>{brand}</option>)}
            </select>
          </div>

          {/* قائمة اختيار الموديل - تفتح ديناميكياً وتتغير حسب الماركة */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>الموديل *</label>
            <select value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} disabled={!formData.brand} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', outline: 'none', fontSize: '13px', opacity: formData.brand ? 1 : 0.6 }} required>
              <option value="">{formData.brand ? 'اختر موديل السيارة تالياً...' : 'يرجى اختيار الماركة أولاً 👆'}</option>
              {availableModels.map((model, idx) => <option key={idx} value={model}>{model}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>السعر * (د.ك)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} placeholder="مثال: 4500" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>سنة الصنع</label>
              <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} placeholder="مثال: 2022" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>الممشى (كم)</label>
              <input type="number" value={formData.kilometers} onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} placeholder="مثال: 50000" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>اللون</label>
              <input type="text" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} placeholder="مثال: أبيض" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>وصف الإعلان</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', height: '80px', resize: 'none', fontSize: '13px' }} placeholder="اكتب تفاصيل إضافية وطريقة التواصل..."></textarea>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '5px' }}>تحميل صورة السيارة</label>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setImages([e.target.files[0]]); }} style={{ fontSize: '12px' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? '⏳ جاري معالجة الإعلان المطور ورفع الصور لـ Vercel Blob...' : '🚀 انشر الإعلان بالقوائم الآن'}
          </button>
        </form>
      </div>
    </div>
  );
}
