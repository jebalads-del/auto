'use client'; // لازم تكون أول سطر لأننا بنستخدم أزرار (Client Component)

import React, { useState } from 'react';

export default function CommercialAdsPage() {
  // 1. بيانات وهمية عشان الكود يشتغل فوراً وتشوف الجدول (تماماً مكان الـ API)
  const [ads, setAds] = useState([
    { id: '1', user_name: 'محمد أحمد', user_email: 'mohamed@test.com', position: 'header', price: '50 د.ك', status: 'pending', duration_days: 30 },
    { id: '2', user_name: 'سارة علي', user_email: 'sara@test.com', position: 'footer', price: '20 د.ك', status: 'approved', duration_days: 15 },
    { id: '3', user_name: 'خالد العتيبي', user_email: 'khaled@test.com', position: 'sidebar', price: '40 د.ك', status: 'deleted', duration_days: 10 },
    { id: '4', user_name: 'نورة عبدالله', user_email: 'noura@test.com', position: 'header', price: '30 د.ك', status: 'pending', duration_days: 20 },
  ]);

  // 2. دالة معالجة الأزرار (هنا نعدل الحالة في الواجهة فقط لإثبات أن الكود يعمل)
  const handleAction = (id: string, action: 'approve' | 'reject' | 'delete') => {
    console.log(`لقد ضغطت على: ${action} للإعلان رقم: ${id}`);

    setAds((prevAds) => 
      prevAds.map((ad) => {
        if (ad.id === id) {
          // إذا ضغطنا على حذف، نغير الحالة إلى deleted
          if (action === 'delete') {
            return { ...ad, status: 'deleted' };
          }
          // إذا ضغطنا على موافقة أو رفض
          return { ...ad, status: action === 'approve' ? 'approved' : 'rejected' };
        }
        return ad;
      })
    );
    
    // هنا مستقبلاً تحط كود الـ API الحقيقي:
    // await fetch(`/api/ads/${id}`, { method: 'POST', body: JSON.stringify({ action }) });
  };

  // 3. دالة إظهار الشارة (Badge) بناءً على الحالة
  const getStatusBadge = (status: string) => {
    if (status === 'pending') return <span style={{ color: '#f59e0b' }}>⏳ قيد المراجعة</span>;
    if (status === 'approved') return <span style={{ color: '#10b981' }}>✅ مقبول</span>;
    if (status === 'rejected') return <span style={{ color: '#ef4444' }}>❌ مرفوض</span>;
    if (status === 'deleted') return <span style={{ color: '#64748b' }}>🗑️ محذوف</span>;
    return <span>{status}</span>;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>لوحة الإعلانات التجارية</h1>
      
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          {/* ترويسة الجدول */}
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'right', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>#</th>
              <th style={{ padding: '12px' }}>المستخدم</th>
              <th style={{ padding: '12px' }}>الموقع</th>
              <th style={{ padding: '12px' }}>السعر</th>
              <th style={{ padding: '12px' }}>الحالة</th>
              <th style={{ padding: '12px' }}>المدة</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>

          {/* جسم الجدول */}
          <tbody>
            {ads.map((ad, index) => (
              <tr key={ad.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{index + 1}</td>
                
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: '500' }}>{ad.user_name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{ad.user_email}</div>
                </td>
                
                <td style={{ padding: '12px' }}>
                  {ad.position === 'header' ? '📰 الهيدر' : (ad.position === 'footer' ? '📌 الفوتر' : '📐 الشريط الجانبي')}
                </td>
                
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{ad.price}</td>
                
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {getStatusBadge(ad.status)}
                </td>
                
                <td style={{ padding: '12px' }}>{ad.duration_days} يوم</td>
                
                {/* عمود الإجراءات */}
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    
                    {/* إذا كانت الحالة معلقة (Pending)، أظهر أزرار الموافقة والرفض */}
                    {ad.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(ad.id, 'approve')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ✅ موافقة
                        </button>
                        
                        <button
                          onClick={() => handleAction(ad.id, 'reject')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ❌ رفض
                        </button>
                      </>
                    )}

                    {/* إذا كانت الحالة ليست محذوفة (أي معلقة أو مقبولة أو مرفوضة)، أظهر زر الحذف */}
                    {ad.status !== 'deleted' && (
                      <button
                        onClick={() => handleAction(ad.id, 'delete')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        🗑️ حذف
                      </button>
                    )}

                    {/* إذا كانت الحالة محذوفة، لا نعرض أزرار، فقط رسالة */}
                    {ad.status === 'deleted' && (
                      <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>
                        ✅ تم الحذف
                      </span>
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
