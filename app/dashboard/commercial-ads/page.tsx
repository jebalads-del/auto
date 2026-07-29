'use client';

import React, { useState } from 'react';

export default function CommercialAdsPage() {
  // --- ⚠️ ضع هنا متغير جلب البيانات الخاص بك ---
  // مثال: const { data: ads } = useQuery(...);
  // أو: const [ads, setAds] = useState([]); useEffect(... fetch ...)
  
  // لكي يشتغل الكود فوراً عند النسخ، وضعت لك بيانات وهمية هنا.
  // يمكنك لاحقاً حذف الـ useState واستخدام بياناتك الحقيقية.
  const [ads, setAds] = useState([
    { id: '1', user_name: 'محمد', user_email: 'mohamed@test.com', position: 'header', price: '50 د.ك', status: 'pending', duration_days: 30 },
    { id: '2', user_name: 'أحمد', user_email: 'ahmed@test.com', position: 'footer', price: '20 د.ك', status: 'approved', duration_days: 15 },
    { id: '3', user_name: 'خالد', user_email: 'khaled@test.com', position: 'sidebar', price: '40 د.ك', status: 'deleted', duration_days: 10 },
  ]);

  // --- هذه هي دالة الإجراءات (يجب أن تعدلها لتتصل بالسيرفر الخاص بك) ---
  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    console.log(`العملية: ${action} للإعلان: ${id}`);

    // هذه الخطوة تقوم بتحديث الواجهة فوراً بدون ريفريش (للتجربة)
    setAds((prevAds) => 
      prevAds.map((ad) => {
        if (ad.id === id) {
          // إذا كان إجراء حذف، غير الحالة إلى deleted
          if (action === 'delete') return { ...ad, status: 'deleted' };
          // إذا كان موافقة أو رفض
          return { ...ad, status: action === 'approve' ? 'approved' : 'rejected' };
        }
        return ad;
      })
    );

    // !!! هنــــا يجب أن تضع كود الـ API الحقيقي الخاص بك !!!
    // مثال:
    // await fetch('/api/ads/update-status', {
    //   method: 'POST',
    //   body: JSON.stringify({ id, action })
    // });
  };

  // --- دالة الشارة ---
  const getStatusBadge = (status: string) => {
    if (status === 'pending') return <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⏳ قيد المراجعة</span>;
    if (status === 'approved') return <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ مقبول</span>;
    if (status === 'rejected') return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ مرفوض</span>;
    if (status === 'deleted') return <span style={{ color: '#64748b', fontWeight: 'bold' }}>🗑️ محذوف</span>;
    return <span>{status}</span>;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>المستخدم</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>الموقع</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>السعر</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>الحالة</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>المدة</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad: any, index: number) => (
              <tr key={ad.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{index + 1}</td>
                <td style={{ padding: '12px' }}>
                  <div>{ad.user_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{ad.user_email}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  {ad.position === 'header' ? '📰 الهيدر' : (ad.position === 'footer' ? '📌 الفوتر' : '📐 جانبي')}
                </td>
                <td style={{ padding: '12px' }}>{ad.price}</td>
                <td style={{ padding: '12px' }}>{getStatusBadge(ad.status)}</td>
                <td style={{ padding: '12px' }}>{ad.duration_days} يوم</td>

                {/* --- هذا هو الجزء الذي يحل مشكلتك (المنطق الشرحي الصحيح) --- */}
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    
                    {/* 1. إذا كانت الحالة "معلقة" فقط، يظهر زر موافقة ورفض */}
                    {ad.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(ad.id, 'approve')}
                          style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          ✅ موافقة
                        </button>
                        <button
                          onClick={() => handleAction(ad.id, 'reject')}
                          style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          ❌ رفض
                        </button>
                      </>
                    )}

                    {/* 2. إذا كانت الحالة "ليست محذوفة"، يظهر زر الحذف */}
                    {ad.status !== 'deleted' && (
                      <button
                        onClick={() => handleAction(ad.id, 'delete')}
                        style={{ padding: '6px 12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        🗑️ حذف
                      </button>
                    )}

                    {/* 3. إذا كانت الحالة "محذوفة"، يظهر نص فقط */}
                    {ad.status === 'deleted' && (
                      <span style={{ color: '#64748b', fontSize: '12px' }}>✅ تم الحذف</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
