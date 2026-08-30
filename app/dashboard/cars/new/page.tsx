'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/db';

export const dynamic = 'force-dynamic';

function AddCarForm() {
  const router = useRouter();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [year, setYear] = useState('');
  const [condition, setCondition] = useState('ممتازة');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `cars/${fileName}`;

      const fileBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('car-images').getPublicUrl(filePath);
      if (data?.publicUrl) {
        setImages(prev => [...prev, data.publicUrl]);
        showMessage('تم رفع الصورة وتأمينها بنجاح', 'success');
      }
    } catch (err: any) {
      showMessage('فشل رفع الصورة: ' + (err.message || 'خطأ في الملف'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !price) {
      showMessage('يرجى ملء الحقول الأساسية المطلوبة', 'error');
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.from('cars').insert([
        {
          brand,
          model,
          price: parseFloat(price),
          year: year ? parseInt(year) : null,
          condition,
          description,
          images,
          status: 'مقبول',
          created_at: new Date().toISOString()
        }
      ]);

      if (!error) {
        showMessage('🎉 تم نشر الإعلان الفاخر وتفعيله حياً بنجاح!', 'success');
        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('redirect') === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        showMessage('خطأ في النشر: ' + error.message, 'error');
      }
    } catch {
      showMessage('خطأ في شبكة الاتصال بالسيرفر', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '550px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>📢 إضافة إعلان سيارة جديدة</h2>
          <button onClick={() => router.back()} style={{ padding: '6px 12px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>عودة</button>
        </div>

        {message.text && (
          <div style={{ padding: '12px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px' }}>الماركة *</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="مثال: تويوتا، نيسان" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px' }}>الموديل *</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required placeholder="مثال: كامري، ألتيما" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px' }}>السعر (د.ك) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px' }}>سنة الصنع</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="مثال: 2026" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px' }}>حالة السيارة</label>
            <input type="text" value={condition} onChange={(e) => setCondition(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px' }}>تفاصيل إضافية</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="اكتب تفاصيل ومواصفات السيارة هنا..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'sans-serif' }} />
          </div>

          <div style={{ border: '2px dashed #cbd5e1', padding: '15px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <label style={{ cursor: 'pointer', display: 'block', fontWeight: '600', color: '#2563eb', fontSize: '14px' }}>
              {uploading ? 'جاري الرفع للحاسوب السحابي...' : '📸 اضغط هنا لإضافة صورة للسيارة'}
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
            
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', justifyContent: 'center' }}>
                {images.map((img, idx) => (
                  <img key={idx} src={img} alt="Car" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || uploading} style={{ width: '100%', padding: '13px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: (loading || uploading) ? 'not-allowed' : 'pointer', opacity: (loading || uploading) ? 0.7 : 1, marginTop: '10px', boxShadow: '0 2px 6px rgba(16,185,129,0.2)' }}>
            {loading ? 'جاري إطلاق الإعلان للجمهور...' : '🚀 نشر وإطلاق الإعلان الحركي'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AddCarPage() {
  return (
    <Suspense fallback={<div>جاري تحميل معرضك ومواصفاتك الفاخرة...</div>}>
      <AddCarForm />
    </Suspense>
  );
}
