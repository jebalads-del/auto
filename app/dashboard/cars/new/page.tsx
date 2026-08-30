'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/db';

export default function AddCarPage() {
  const router = useRouter();
  const [brand, setBrand] = useState('هوندا');
  const [model, setModel] = useState('أكورد');
  const [price, setPrice] = useState('4500');
  const [currency, setCurrency] = useState('دينار كويتي');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // نشر الإعلان حياً ومباشرة في جدول السيارات بوضع مقبول تلقائياً للأدمن
      const { error } = await supabase.from('cars').insert([
        {
          brand,
          model,
          price: parseFloat(price),
          status: 'مقبول', // تفعيل تلقائي فوري لأن الناشر هو المدير العام
          created_at: new Date().toISOString()
        }
      ]);

      if (!error) {
        setMessage({ text: '🎉 تم نشر الإعلان بنجاح واكتمل التفعيل حياً!', type: 'success' });
        
        setTimeout(() => {
          // 🚀 التوجيه الذكي الحاسم: يعود للأدمن فوراً بعد النشر بلمحة بصر
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('redirect') === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        setMessage({ text: 'حدث خطأ أثناء النشر: ' + error.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'خطأ في الاتصال بقاعدة البيانات', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>📢 إضافة إعلان سيارة جديدة</h2>
          <button onClick={() => router.back()} style={{ padding: '6px 12px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>← عودة</button>
        </div>

        {message.text && (
          <div style={{ padding: '12px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>الماركة *</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>الموديل *</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>السعر * ({currency})</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '10px', boxShadow: '0 2px 6px rgba(16,185,129,0.2)' }}>
            {loading ? 'جاري نشر الإعلان حياً...' : '🚀 نشر الإعلان الآن'}
          </button>
        </form>
      </div>
    </div>
  );
}
