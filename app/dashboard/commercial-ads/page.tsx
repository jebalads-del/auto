'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CommercialAd {
  id: number;
  user_id: number;
  position: string;
  status: string;
  price: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  image_url: string;
}

export default function CommercialAdsAdminPage() {
  const [ads, setAds] = useState<CommercialAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/admin/commercial-ads').catch(() => null);
      if (!res) throw new Error('فشل الاتصال بالسيرفر الخلفي');
      
      const data = await res.json().catch(() => null);
      if (data) {
        if (Array.isArray(data)) setAds(data);
        else if (Array.isArray(data.ads)) setAds(data.ads);
        else if (data.success && Array.isArray(data.ads)) setAds(data.ads);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    setMessage('');
    setError('');
    const newStatus = String(currentStatus).toLowerCase() === 'approved' ? 'pending' : 'approved';
    
    try {
      const res = await fetch('/api/admin/commercial-ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('تم تحديث حالة الإعلان بنجاح');
        fetchAds();
      } else {
        setError(data.message || 'فشل تحديث الحالة');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء التحديث');
    }
  };
  const handleDeleteAd = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً من قاعدة البيانات؟')) return;
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/api/admin/commercial-ads?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('تم حذف الإعلان بنجاح من قاعدة البيانات والجدول');
        fetchAds();
      } else {
        setError(data.message || 'فشل حذف الإعلان التجاري');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء عملية الحذف');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#64748b', fontSize: '15px' }}>جاري تحميل لوحة الإعلانات الفاخرة...</p>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>📊 إدارة الإعلانات التجارية</h1>
        <Link href="/dashboard" style={{ textDecoration: 'none', backgroundColor: '#475569', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
          ← العودة للوحة التحكم
        </Link>
      </div>

      {message && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold', fontSize: '14px' }}>✅ {message}</div>}
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold', fontSize: '14px' }}>❌ {error}</div>}

      {(!ads || ads.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          📺 لا توجد إعلانات تجارية مرفوعة حالياً في النظام
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 15px', color: '#334155', fontSize: '14px' }}>المعرف</th>
                <th style={{ padding: '12px 15px', color: '#334155', fontSize: '14px' }}>الموقع</th>
                <th style={{ padding: '12px 15px', color: '#334155', fontSize: '14px' }}>الحالة</th>
                <th style={{ padding: '12px 15px', color: '#334155', fontSize: '14px' }}>السعر</th>
                <th style={{ padding: '12px 15px', color: '#334155', fontSize: '14px' }}>المدة (أيام)</th>
                <th style={{ padding: '12px 15px', color: '#334155', fontSize: '14px' }}>المعاينة</th>
                <th style={{ padding: '12px 15px', color: '#334155', fontSize: '14px', textAlign: 'center' }}>العمليات</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => {
                if (!ad) return null;
                // 🛡️ صيانة وحماية الحقول الفردية لكل سطر منعاً لانهيار الصفحة
                const adId = ad.id || Math.random();
                const adPosition = String(ad.position).toLowerCase() === 'header' ? 'علوي (الهيدر)' : (String(ad.position).toLowerCase() === 'footer' ? 'سفلي (الفوتر)' : ad.position || 'عام');
                const adStatus = String(ad.status).toLowerCase() === 'approved' ? 'مقبول ✨' : 'قيد الانتظار ⏳';
                const adPrice = ad.price || 0;
                const adDuration = ad.duration_days || 0;
                const adImgUrl = ad.image_url ? String(ad.image_url) : '';

                return (
                  <tr key={adId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 15px', fontSize: '13px', color: '#475569' }}>#{adId}</td>
                    <td style={{ padding: '12px 15px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>{adPosition}</td>
                    <td style={{ padding: '12px 15px', fontSize: '13px' }}>
                      <span style={{ backgroundColor: String(ad.status).toLowerCase() === 'approved' ? '#d1fae5' : '#fef3c7', color: String(ad.status).toLowerCase() === 'approved' ? '#065f46' : '#92400e', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}>
                        {adStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', fontSize: '13px', color: '#10b981', fontWeight: 'bold' }}>{adPrice.toLocaleString()} د.ك</td>
                    <td style={{ padding: '12px 15px', fontSize: '13px', color: '#475569' }}>{adDuration} يوم</td>
                    <td style={{ padding: '12px 15px' }}>
                      {adImgUrl ? (
                        <img src={adImgUrl} alt="معاينة البانر" style={{ width: '100px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }} />
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>لا توجد صورة</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 15px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ad.id, ad.status)}
                        style={{ backgroundColor: String(ad.status).toLowerCase() === 'approved' ? '#f59e0b' : '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        {String(ad.status).toLowerCase() === 'approved' ? '⏸️ إيقاف' : '✅ تفعيل ونشر'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAd(ad.id)}
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        🗑️ حذف نهائي
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// نهاية الكود البرمجي المحصن بالكامل لإدارة الإعلانات التجارية المحدثة بنجاح
