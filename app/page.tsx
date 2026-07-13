'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMaint, setIsMaint] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('isMaintenance') === 'true') {
      setIsMaint(true)
      setLoading(false)
      return
    }
    fetch('/api/ads').then((res) => res.json()).then((data) => {
      if (Array.isArray(data)) setAds(data.filter(ad => ad.status === 'active'))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (isMaint) {
    return (
      <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛠️</div>
        <h1 style={{ color: '#38bdf8' }}>الموقع تحت الصيانة حالياً</h1>
        <p style={{ color: '#94a3b8', maxWidth: '400px' }}>نعمل حالياً على تطوير المنصة لتقديم أفضل تجربة. سنعود للعمل قريباً جداً، شكراً لكم!</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '15px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '20px', color: 'white' }}>
        <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '20px' }}>🚗 موقع سيارتي</h1>
        <Link href="/login" style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>لوحة التحكم</Link>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
        {loading ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>جاري التحميل...</p> : ads.length === 0 ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>لا توجد سيارات معروضة.</p> : ads.map((ad) => {
          let imgs: string[] = []
          try { if (ad.image_url) imgs = JSON.parse(ad.image_url) } catch { if (ad.image_url) imgs = [ad.image_url] }
          return (
            <div key={ad.id} style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '100%', height: '180px', backgroundColor: '#cbd5e1' }}>
                {imgs.length > 0 ? <img src={imgs[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>📸 بلا صور</div>}
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>{ad.title}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '4px', fontSize: '12px' }}>
                  <div>🔖 <strong>الماركة:</strong> {ad.brand || 'عام'}</div>
                  <div>🚘 <strong>الفئة:</strong> {ad.model || 'عام'}</div>
                  <div>📅 <strong>السنة:</strong> {ad.year || 'غير محدد'}</div>
                  <div>🎨 <strong>اللون:</strong> {ad.color || 'غير محدد'}</div>
                  <div style={{ gridColumn: 'span 2' }}>🛣️ <strong>الممشى:</strong> {ad.mileage || 'غير محدد'}</div>
                </div>
                {ad.extra_info && <div style={{ backgroundColor: '#f0f9ff', padding: '6px', borderRadius: '4px', fontSize: '12px', color: '#0369a1' }}>📋 {ad.extra_info}</div>}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{ad.price} $</span>
                </div>
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
