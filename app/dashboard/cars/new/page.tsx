"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', price: '', kilometers: '', color: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('🎉 تم نشر وحفظ الإعلان بنجاح في قاعدة البيانات وينتظر مراجعة الإدارة!');
        setFormData({ brand: '', model: '', year: '', price: '', kilometers: '', color: '', description: '' });
        setTimeout(() => { router.push('/dashboard/admin'); }, 2000);
      } else {
        setError(data.message || 'فشل في حفظ البيانات، تأكد من المعايير');
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء معالجة البيانات: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '15px', direction: 'rtl', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Link href="/dashboard/admin" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>← العودة للوحة التحكم</Link>
      <h2 style={{ color: '#1e293b', marginTop: '15px', marginBottom: '20px' }}>➕ إضافة إعلان سيارة جديدة</h2>
      
      {error && <p style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', border: '1px solid #fca5a5' }}>❌ {error}</p>}
      {success && <p style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '6px', fontSize: '13px', border: '1px solid #a7f3d0' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>الماركة *</label>
          <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="مثال: تويوتا، نيسان" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>الموديل *</label>
          <input type="text" required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="مثال: كامري، ألتيما" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>السعر (د.ك) *</label>
            <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>سنة الصنع *</label>
            <input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>الممشي (كم) *</label>
            <input type="number" required value={formData.kilometers} onChange={e => setFormData({...formData, kilometers: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>اللون *</label>
            <input type="text" required value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="مثال: أبيض، أسود" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>وصف الإعلان</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
        </div>
        <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px', fontSize: '14px' }}>{loading ? 'جاري النشر وتطهير المعايير...' : '🚀 نشر الإعلان الآن'}</button>
      </form>
    </div>
  );
}
