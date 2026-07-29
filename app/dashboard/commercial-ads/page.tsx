// هذا هو الملف: auto/app/dashboard/commercial-ads/page.tsx

'use client'; // ضروري لأننا بنستخدم التفاعل (onClick)

import React from 'react';

// افترضنا أن هذه الدوال موجودة عندك أو استوردتها من مكان آخر
// لو مش موجودة، اكتبها داخل الملف (مكتوبة شرحها بالأسفل)
const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
  console.log(`Performing action: ${action} on ad ID: ${id}`);
  // هنا تضع كود الاتصال بالسيرفر الخاص بك (API Request)
  // مثال: await fetch(`/api/ads/${id}`, { method: 'POST', body: JSON.stringify({ action }) });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending': return <span style={{ color: '#f59e0b' }}>🟠 قيد المراجعة</span>;
    case 'approved': return <span style={{ color: '#10b981' }}>🟢 تمت الموافقة</span>;
    case 'rejected': return <span style={{ color: '#ef4444' }}>🔴 مرفوض</span>;
    case 'deleted': return <span style={{ color: '#64748b' }}>⚪ تم الحذف</span>;
    default: return <span>{status}</span>;
  }
};

// البيانات الوهمية (لو مش جايبة من API، حطها هنا عشان تشتغل)
const mockAds = [
  { id: '1', user_name: 'أحمد', user_email: 'ahmed@test.com', position: 'header', price: '50 د.ك', status: 'pending', duration_days: 30 },
  { id: '2', user_name: 'سارة', user_email: 'sara@test.com', position: 'footer', price: '20 د.ك', status: 'approved', duration_days: 15 },
  { id: '3', user_name: 'خالد', user_email: 'khaled@test.com', position: 'sidebar', price: '40 د.ك', status: 'deleted', duration_days: 10 },
];

export default function CommercialAdsPage() {
  // لو بتجيب البيانات من API، استبدل السطر اللي تحت بـ: const { data: ads } = useQuery(...)
  const ads = mockAds; 

  return (
    <div style={{ padding: '20px' }}>
      <h1>لوحة التحكم - الإعلانات التجارية</h1>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>#</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>المستخدم</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>الموقع</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>السعر</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>الحالة</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>المدة (يوم)</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad, index) => (
              <tr key={ad.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{index + 1}</td>
                <td style={{ padding: '12px' }}>
                  <div>{ad.user_name || 'غير محدد'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{ad.user_email}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  {ad.position === 'header' ? '📰 الهيدر' : '📌 الفوتر'}
                </td>
                <td style={{ padding: '12px' }}>{ad.price}</td>
                <td style={{ padding: '12px' }}>{getStatusBadge(ad.status)}</td>
                <td style={{ padding: '12px' }}>{ad.duration_days} يوم</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    
                    {/* إذا كانت الحالة معلقة، نعرض أزرار الموافقة والرفض */}
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
                            fontSize: '14px',
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
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ❌ رفض
                        </button>
                      </>
                    )}

                    {/* إذا كانت الحالة ليست محذوفة، نعرض زر الحذف */}
                    {ad.status !== 'deleted' && (
                      <button
                        onClick={() => handleAction(ad.id, 'delete')}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        🗑️ حذف
                      </button>
                    )}

                    {/* إذا كانت الحالة محذوفة، نعرض النص */}
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
