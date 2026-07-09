'use client'

import { useEffect, useState } from 'react'

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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🚗 سيارتي - الإعلانات</h1>
      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {ads.map(ad => (
            <div key={ad.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>{ad.title}</h3>
              <p>{ad.description}</p>
              <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>{ad.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
