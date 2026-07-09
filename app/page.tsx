'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Ad {
  id: number
  title: string
  description: string
  price: string
}

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        setAds(data)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #0070f3', paddingBottom: '20px' }}>
        <h1>🚗 سيارتي</h1>
        <nav>
          <Link href="/login" style={{ marginLeft: '20px', color: '#0070f3', fontWeight: 'bold' }}>
            تسجيل دخول
          </Link>
          <Link href="/dashboard" style={{ marginLeft: '20px', color: '#0070f3', fontWeight: 'bold' }}>
            لوحة التحكم
          </Link>
        </nav>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2>الإعلانات المتاحة</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : ads.length === 0 ? (
          <p>لا توجد إعلانات حالياً</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {ads.map(ad => (
              <Link href={`/dashboard`} key={ad.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  backgroundColor: '#f9f9f9',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{ad.title}</h3>
                  <p style={{ color: '#666', margin: '0 0 10px 0' }}>{ad.description}</p>
                  <p style={{ color: '#e74c3c', fontWeight: 'bold', margin: 0, fontSize: '18px' }}>{ad.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
