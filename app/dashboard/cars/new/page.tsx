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
  const [color, setColor] = useState('أبيض');
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
      
      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
      if (data) setImages([...images, data.publicUrl]);
    } catch { 
      setMsg('❌ خطأ في رفع الصورة'); 
    } finally { 
      setUploading(false); 
    }
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
      if (!error) { 
        setMsg('✅ تم إرسال الإعلان للإدارة بنجاح وجاري مراجعته ونشره!'); 
        setTimeout(() => router.push('/dashboard'), 2000);
      } else { 
        setMsg('❌ خطأ: ' + error.message); 
      }
    } catch { 
      setMsg('❌ خطأ في الاتصال بالخادم'); 
    } finally { 
      setUploading(false); 
    }
  };
  return (
    <div style={{ direction: 'rtl', padding: '20px 15px', maxWidth: '550px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
        <span style={{ fontSize: '20px' }}>➕</span>
        <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>إضافة إعلان سيارة جديدة</h1>
      </div>
      
      {msg && <div style={{ padding: '12px', backgroundColor: msg.includes('✅') ? '#d1fae5' : '#fee2e2', color: msg.includes('✅') ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>{msg}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>ماركة السيارة</label><input type="text" placeholder="مثال: مرسيدس، تويوتا" required value={brand} onChange={e => setBrand(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} /></div>
        <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>الموديل</label><input type="text" placeholder="مثال: E300، لاندكروزر" required value={model} onChange={e => setModel(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} /></div>
        <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>السعر المتوقع (بالدينار الكويتي)</label><input type="number" placeholder="ادخل السعر" required value={price} onChange={e => setPrice(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', fontWeight: 'bold', color: '#059669' }} /></div>
        <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>المسافة المقطوعة (كم)</label><input type="number" placeholder="اختياري" value={kilometers} onChange={e => setKilometers(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} /></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>سنة الصنع</label><select value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}>{Array.from({ length: 2027 - 1990 + 1 }, (_, i) => 2027 - i).map(y => <option key={y} value={y}>{y}</option>)}</select></div>
          <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>اللون الخارجي</label><select value={color} onChange={e => setColor(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}>{['أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق', 'ذهبي', 'بني'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>

        <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>تفاصيل ومواصفات إضافية</label><textarea placeholder="اكتب حالة السيارة، الفحص، إلخ..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'sans-serif', boxSizing: 'border-box', resize: 'none' }} /></div>
        
        <div style={{ padding: '15px', border: '2px dashed #cbd5e1', borderRadius: '10px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#1e293b', marginBottom: '6px', cursor: 'pointer' }}>📸 اضغط لاختيار وتحميل صور السيارة</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ fontSize: '12px', width: '100%' }} />
          {uploading && <p style={{ fontSize: '12px', color: '#2563eb', margin: '8px 0 0 0', fontWeight: '500' }}>⏳ جاري رفع الصورة وتأمينها في المعرض...</p>}
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '5px' }}>
          {images.map((img, i) => <img key={i} src={img} alt="preview" style={{ width: '65px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />)}
        </div>

        <button type="submit" disabled={uploading} style={{ width: '100%', padding: '13px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.2)', transition: 'background 0.2s', marginTop: '5px' }}>
          {uploading ? 'جاري الحفظ والمعالجة...' : '🚀 إرسال ونشر الإعلان المكتمل'}
        </button>
      </form>
    </div>
  );
}
