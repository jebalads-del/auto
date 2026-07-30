'use client';

import { useEffect, useState } from 'react';

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
  link_url: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

export default function CommercialAdsPage() {
  const [ads, setAds] = useState<CommercialAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/admin/commercial-ads');
      const data = await res.json();
      if (data.success) {
        setAds(data.ads);
      }
    } catch (error) {
      console.error('خطأ في جلب الطلبات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (adId: number, action: string) => {
    try {
      const res = await fetch('/api/admin/commercial-ads/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        fetchAds();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.message}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('خطأ:', error);
      setMessage('❌ حدث خطأ');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; text: string }> = {
      pending: { bg: '#fef3c7', color: '#92400e', text: '⏳ قيد المراجعة' },
      approved: { bg: '#d1fae5', color: '#065f46', text: '✅ مقبول' },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: '❌ مرفوض' },
      deleted: { bg: '#f1f5f9', color: '#64748b', text: '🗑️ محذوف' },
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>📢 طلبات الإعلانات التجارية</h1>

      {message && (
        <div style={{
          backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#991b1b',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '15px',
        }}>
          {message}
        </div>
      )}

      {loading ? (
        <p>جاري التحميل...</p>
      ) : ads.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          لا توجد طلبات إعلانات تجارية
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'right' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>المستخدم</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الموقع</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>السعر</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الحالة</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>المدة</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, index) => (
                <tr key={ad.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{index + 1}</td>
                  <td style={{ padding: '12px' }}>
                    <div>{ad.user_name || 'مستخدم'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{ad.user_email}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {ad.position === 'header' ? '📌 الهيدر' : '📌 الفوتر'}
                  </td>
                  <td style={{ padding: '12px' }}>${ad.price}</td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(ad.status)}</td>
                  <td style={{ padding: '12px' }}>{ad.duration_days} يوم</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {ad.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(ad.id, 'approve')}
                            style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            ✅ موافقة
                          </button>
                          <button
                            onClick={() => handleAction(ad.id, 'reject')}
                            style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            ❌ رفض
                          </button>
                        </>
                      )}
                      {ad.status !== 'deleted' ? (
                        <button
                          onClick={() => handleAction(ad.id, 'delete')}
                          style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          🗑️ حذف
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '12px' }}>تم الحذف 🗑️</span>
                      )}
                    </div>
                  </td>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
