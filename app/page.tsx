'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // عرض الإعلانات النشطة والموافق عليها فقط للزوار
          const activeAds = data.filter(ad => ad.status === 'active')
          setAds(activeAds)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
      {/* الهيدر العلوي للموقع */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '24px' }}>🚗 موقع سيارتي (Sayarty Store)</h1>
        <Link href="/login" style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>🛠️ لوحة التحكم</Link>
      </header>

      {/* قسم الإعلانات الحية */}
      <main>
        <h2 style={{ color: '#1e293b', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>السيارات المعروضة للبيع حديثاً</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '18px' }}>جاري تحميل السيارات...</p>
        ) : ads.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '16px', backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>لا توجد سيارات معروضة حالياً في المعرض.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {ads.map((ad) => {
              // معالجة الصور المحفوظة (سواء نص مصفوفة أو رابط واحد)
              let carImages: string[] = []
              try {
                if (ad.image_url) {
                  carImages = JSON.parse(ad.image_url)
                }
              } catch {
                if (ad.image_url) carImages = [ad.image_url]
              }

              return (
                <div key={ad.id} style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  {/* صورة السيارة */}
                  <div style={{ width: '100%', height: '200px', backgroundColor: '#cbd5e1', position: 'relative' }}>
                    {carImages.length > 0 ? (
                      <img src={carImages[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>📸 لا توجد صور متوفرة</div>
                    )}
                  </div>

                  {/* تفاصيل وبيانات السيارة */}
                  <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{ad.title}</h3>
                    
                    {/* شبكة المواصفات الجديدة */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#334155' }}>
                      <div>🔖 <strong>الماركة:</strong> {ad.brand || 'غير محدد'}</div>
                      <div>🚘 <strong>الموديل:</strong> {ad.model || 'غير محدد'}</div>
                      <div>📅 <strong>السنة:</strong> {ad.year || 'غير محدد'}</div>
                      <div>🎨 <strong>اللون:</strong> {ad.color || 'غير محدد'}</div>
                      <div style={{ gridColumn: 'span 2' }}>🛣️ <strong>الممشى:</strong> {ad.mileage || 'غير محدد'}</div>
                    </div>

                    {/* الوصف العام */}
                    {ad.description && (
                      <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxTruncate: 'vertical', overflow: 'hidden' }}>
                        {ad.description}
                      </p>
                    )}

                    {/* ميزات وصندوق معلومات إضافية */}
                    {ad.extra_info && (
                      <div style={{ backgroundColor: '#f0f9ff', borderRight: '3px solid #0ea5e9', padding: '8px', borderRadius: '4px', fontSize: '13px', color: '#0369a1' }}>
                        📋 <strong>ميزات إضافية:</strong> {ad.extra_info}
                      </div>
                    )}

                    {/* السعر في الأسفل */}
                    <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{ad.price.toLocaleString()} $</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>المعرف: #{ad.id}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
