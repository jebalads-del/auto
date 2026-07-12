'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ads' | 'create_ad' | 'payment'>('ads')

  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [planType, setPlanType] = useState<'free' | 'paid'>('free')
  const [images, setImages] = useState<string[]>([])
  const [formLoading, setFormLoading] = useState(false)

  const [paypalEmail, setPaypalEmail] = useState('jebal.payments@gmail.com')
  const [westernName, setWesternName] = useState('Jebal Ads Company')
  const [westernCountry, setWesternCountry] = useState('Yemen')

  const fetchAds = () => {
    setLoading(true)
    fetch('/api/ads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAds(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const maxAllowed = planType === 'free' ? 2 : 5

    if (images.length + files.length > maxAllowed) {
      alert('Plan limit exceeded! Free max is 2, Paid max is 5.')
      return
    }

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice) return alert('Title and Price are required')
    setFormLoading(true)

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTitle, 
          price: Number(newPrice), 
          description: newDesc,
          image_url: images.length > 0 ? JSON.stringify(images) : 'https://unsplash.com'
        })
      })
      const result = await res.json()
      if (result.success) {
        alert('Car published successfully!')
        setNewTitle('')
        setNewPrice('')
        setNewDesc('')
        setImages([])
        fetchAds()
        setActiveTab('ads')
      } else {
        alert('Upload failed')
      }
    } catch (err) {
      console.error(err)
      alert('Server Connection Error')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f5f7fb', padding: '15px', boxSizing: 'border-box' }}>
      
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#38bdf8', fontSize: '20px' }}>🛠️ لوحة تحكم سيارتي</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button onClick={() => setActiveTab('ads')} style={{ padding: '10px', backgroundColor: activeTab === 'ads' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            🚗 الإعلانات ({ads.length})
          </button>
          <button onClick={() => setActiveTab('create_ad')} style={{ padding: '10px', backgroundColor: activeTab === 'create_ad' ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            ➕ إنشاء إعلان
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={() => setActiveTab('payment')} style={{ padding: '10px', backgroundColor: activeTab === 'payment' ? '#f59e0b' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
            💳 طرق الدفع
          </button>
          <Link href="/" style={{ padding: '10px', textAlign: 'center', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
            🏠 خروج للموقع
          </Link>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        
        {activeTab === 'ads' && (
          <div>
            <h3 style={{ color: '#334155', margin: '0 0 15px 0' }}>إدارة الإعلانات الحالية</h3>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>جاري التحميل من Neon...</p>
            ) : ads.length === 0 ? (
              <div>
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>لا توجد إعلانات معروضة حالياً.</p>
                <button onClick={() => setActiveTab('create_ad')} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>أضف أول سيارة الآن</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ads.map((ad) => (
                  <div key={ad.id} style={{ padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#334155', fontWeight: 'bold' }}>{ad.title}</div>
                      <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '13px', marginTop: '4px' }}>{ad.price} $</div>
                    </div>
                    <button onClick={() => router.push(`/dashboard/edit/${ad.id}`)} style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px' }}>تعديل</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create_ad' && (
          <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#334155', margin: 0 }}>➕ نشر إعلان سيارة جديد</h3>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>باقة ونوع الإعلان المختار:</label>
              <select value={planType} onChange={(e) => { setPlanType(e.target.value as 'free' | 'paid'); setImages([]); }} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#fff' }}>
                <option value="free">باقة مجانية (حد أقصى 2 صور)</option>
                <option value="paid">باقة مدفوعة متميزة (حد أقصى 5 صور)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>عنوان السيارة (تويوتا، مرسيدس...):</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>السعر بالدولار ($):</label>
              <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>تحميل صور السيارة مباشرة من جهازك:</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#f8fafc' }} />
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>الصور المختارة حالياً: {images.length} من أصل {planType === 'free' ? 2 : 5}</p>
              
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                      <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
