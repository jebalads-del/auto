'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function NewCarPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [year, setYear] = useState('2026');
  const [kilometers, setKilometers] = useState('');
  const [color, setColor] = useState('أسود');
  const [currency, setCurrency] = useState('د.ك');
  const [description, setDescription] = useState('');
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setLoading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('car-images').getPublicUrl(filePath);
      if (data) setImages([...images, data.publicUrl]);
    } catch {
      setMsg('❌ خطأ أثناء رفع الصورة');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('cars').insert({
        brand: brand.trim(),
        model: model.trim(),
        price: Number(price),
        year: Number(year),
        kilometers: kilometers ? Number(kilometers) : null,
        color,
        currency,
        description: description.trim(),
        images,
        status: 'pending',
        user_id: user?.id || null
      });

      if (!error) {
        setMsg('✅ تم إرسال إعلان السيارة بنجاح! بانتظار مراجعة الإدارة ونشره.');
        router.push('/dashboard');
      } else {
        setMsg('❌ حدث خطأ أثناء إرسال الإعلان: ' + error.message);
      }
    } catch {
      setMsg('❌ خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ direction: 'rtl', padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>➕ إضافة إعلان سيارة جديدة</h1>
      
      {msg && <div style={{ padding: '12px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: '600' }}>{msg}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
        <input type="text" placeholder="الماركة (مثال: مرسيدس)" required value={brand} onChange={e => setBrand(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input type="text" placeholder="الموديل (مثال: E300)" required value={model} onChange={e => setModel(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input type="number" placeholder="السعر" required value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input type="number" placeholder="المسافة المقطوعة (كم)" value={kilometers} onChange={e => setKilometers(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        
        <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
          {Array.from({ length: 2027 - 1988 + 1 }, (_, i) => 2027 - i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select value={color} onChange={e => setColor(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
          {['أسود', 'أبيض', 'أحمر', 'أزرق', 'رمادي', 'فضي', 'ذهبي', 'بني', 'أخضر'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <textarea placeholder="وصف إضافي للسيارة..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'sans-serif' }} />
        
        <div style={{ padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>📸 تحميل صور السيارة:</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
          {uploading && <p style={{ fontSize: '12px', color: '#2563eb', margin: '5px 0 0 0' }}>⏳ جاري رفع الصورة للسيرفر...</p>}
        </div>

        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginTop: '5px' }}>
          {images.map((img, i) => <img key={i} src={img} alt="preview" style={{ width: '60px', height: '45px', borderRadius: '4px', objectFit: 'cover' }} />)}
        </div>

        <button type="submit" disabled={uploading} style={{ padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          {uploading ? 'جاري المعالجة...' : '🚀 إرسال ونشر الإعلان المكتمل'}
        </button>
      </form>
    </div>
  );
}
