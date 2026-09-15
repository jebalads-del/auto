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
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('car-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
      if (data) setImages([...images, data.publicUrl]);
    } catch { setMsg('❌ خطأ في رفع الصورة'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('cars').insert({
        brand: brand.trim(), model: model.trim(), price: Number(price),
        year: Number(year), kilometers: kilometers ? Number(kilometers) : null,
        color, currency, description: description.trim(), images, status: 'pending', user_id: user?.id || null
      });
      if (!error) { setMsg('✅ تم نشر الإعلان بنجاح!'); router.push('/dashboard'); }
      else { setMsg('❌ خطأ: ' + error.message); }
    } catch { setMsg('❌ خطأ في الاتصال بالخادم'); } finally { setUploading(false); }
  };

  return (
    <div style={{ direction: 'rtl', padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>➕ إضافة إعلان سيارة جديدة</h1>
      {msg && <div style={{ padding: '10px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '15px' }}>{msg}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
        <input type="text" placeholder="الماركة" required value={brand} onChange={e => setBrand(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input type="text" placeholder="الموديل" required value={model} onChange={e => setModel(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input type="number" placeholder="السعر" required value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <input type="number" placeholder="المسافة (كم)" value={kilometers} onChange={e => setKilometers(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <select value={color} onChange={e => setColor(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
          {['أسود', 'أبيض', 'أحمر', 'أزرق', 'رمادي', 'فضي', 'ذهبي', 'بني', 'أخضر'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        </div>
        <button type="submit" disabled={uploading} style={{ padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {uploading ? 'جاري المعالجة...' : '🚀 إرسال ونشر الإعلان'}
        </button>
      </form>
    </div>
  );
}
