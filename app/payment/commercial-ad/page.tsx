'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function NewCommercialAdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    position: 'header',
    price: '50',
    durationDays: '30'
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      if (!userId) {
        setError('يجب تسجيل الدخول أولاً لإرسال إعلان تجاري');
        setLoading(false);
        return;
      }

      if (!image) {
        setError('يرجى تحميل صورة البانر الإعلاني أولاً');
        setLoading(false);
        return;
      }

      // تحويل الصورة المرفوعة إلى صيغة Base64 لتمريرها عبر الـ API
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });

      // إعداد البيانات المنسقة بالكامل لتتطابق مع الـ API وقاعدة البيانات
      const payload = {
        userId: parseInt(userId, 10),
        position: formData.position,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays, 10),
        imageUrl: base64Image
      };

      const response = await fetch('/api/commercial-ads', {
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

      if (data.success) {
        setSuccess('تم إرسال وحفظ الإعلان بنجاح في قاعدة البيانات وبانتظار الأدمن!');
        setImage(null);
        setImagePreview('');
        setTimeout(() => { router.push('/dashboard'); }, 2000);
      } else {
        setError(data.message || 'فشل إرسال الإعلان التجاري');
      }
    } catch (err: any) {
      setError('حدث خطأ غير متوقع أثناء عملية الإرسال');
    } finally {
      setLoading(false);
    }
  };
  const styIn = {
    width: '100%', padding: '10px', borderRadius: '8px',
    border: '1px solid #ccc', marginTop: '5px', boxSizing: 'border-box' as const,
    color: '#1e293b', backgroundColor: '#f8fafc'
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button type="button" onClick={() => router.push('/dashboard')} style={{ marginBottom: '15px', padding: '8px 12px', border: 'none', backgroundColor: '#475569', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
        ← العودة للوحة التحكم
      </button>

      <h1 style={{ textAlign: 'center', fontSize: '20px', marginBottom: '20px', color: '#1e3a8a' }}>📺 طلب ومشر بانر إعلاني جديد</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>❌ {error}</div>}
      {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>✅ {success}</div>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155' }}>📍 موضع البانر الإعلاني *</label>
          <select required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} style={styIn}>
            <option value="header">علوي (الهيدر الرئيسي للموقع)</option>
            <option value="footer">سفلي (الفوتر أسفل صالة العرض)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155' }}>📅 مدة عرض الإعلان التجاري *</label>
          <select required value={formData.durationDays} onChange={(e) => {
            const days = e.target.value;
            const price = days === '30' ? '50' : (days === '90' ? '120' : '400');
            setFormData({ ...formData, durationDays: days, price: price });
          }} style={styIn}>
            <option value="30">30 يوماً (بـ 50 د.ك)</option>
            <option value="90">90 يوماً (بـ 120 د.ك)</option>
            <option value="365">سنة كاملة (بـ 400 د.ك)</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155' }}>💰 التكلفة الإجمالية المعتمدة</label>
          <input type="text" disabled value={`${formData.price} دينار كويتي`} style={{ ...styIn, backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: 'bold', color: '#10b981' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155' }}>📸 صورة البانر الإعلاني *</label>
          <input type="file" required accept="image/*" onChange={handleImageChange} style={styIn} />
          {imagePreview && (
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>👀 معاينة البانر قبل الإرسال:</p>
              <img src={imagePreview} alt="معاينة" style={{ width: '100%', maxHeight: '100px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#93c5fd' : '#1e3a8a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'جاري معالجة وحفظ الطلب...' : '📺 إرسال البانر للإدارة'}
        </button>
      </form>
    </div>
  );
}
