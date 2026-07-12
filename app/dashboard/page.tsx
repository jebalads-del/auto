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
    fetch('/api/ads').then((res) => res.json()).then((data) => {
      if (Array.isArray(data)) setAds(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchAds() }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const maxAllowed = planType === 'free' ? 2 : 5
    if (images.length + files.length > maxAllowed) {
      alert('تم تجاوز حد الصور المسموح به لهذه الباقة!')
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

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice) return alert('الرجاء كتابة العنوان والسعر')
    setFormLoading(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTitle, price: Number(newPrice), description: newDesc,
          image_url: images.length > 0 ? JSON.stringify(images) : ''
        })
      })
      const result = await res.json()
      if (result.success) {
        alert('تم النشر بنجاح!')
        setNewTitle(''); setNewPrice(''); setNewDesc(''); setImages([])
        fetchAds(); setActiveTab('ads')
      } else { alert('فشل النشر') }
    } catch { alert('خطأ في الاتصال') } finally { setFormLoading(false) }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f5f7fb', padding: '15px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#38bdf8' }}>🛠️ لوحة تحكم سيارتي</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button onClick={() => setActiveTab('ads')} style={{ padding: '10px', backgroundColor: activeTab === 'ads' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>🚗 الإعلانات ({ads.length})</button>
          <button onClick={() => setActiveTab('create_ad')} style={{ padding: '10px', backgroundColor: activeTab === 'create_ad' ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>➕ إنشاء إعلان</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={() => setActiveTab('payment')} style={{ padding: '10px', backgroundColor: activeTab === 'payment' ? '#f59e0b' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>💳 طرق الدفع</button>
          <Link href="/" style={{ padding: '10px', textAlign: 'center', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>🏠 خروج للموقع</Link>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px' }}>
        {activeTab === 'ads' && (
          <div>
            <h3>إدارة الإعلانات الحالية</h3>
            {loading ? <p>جاري التحميل...</p> : ads.length === 0 ? <p>لا توجد إعلانات معروضة حالياً.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ads.map((ad) => (
                  <div key={ad.id} style={{ padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>{ad.title}</strong><div style={{ color: '#0ea5e9' }}>{ad.price} $</div></div>
                    <button onClick={() => router.push(`/dashboard/edit/${ad.id}`)} style={{ padding: '6px 12px' }}>تعديل</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create_ad' && (
          <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3>➕ نشر إعلان سيارة جديد</h3>
            <select value={planType} onChange={(e) => { setPlanType(e.target.value as 'free' | 'paid'); setImages([]); }} style={{ width: '100%', padding: '10px' }}>
              <option value="free">باقة مجانية (حد أقصى 2 صور)</option>
              <option value="paid">باقة مدفوعة متميزة (حد أقصى 5 صور)</option>
            </select>
            <input type="text" placeholder="عنوان السيارة" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px' }} required />
            <input type="number" placeholder="السعر ($)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ width: '100%', padding: '10px' }} required />
            <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ width: '100%', padding: '10px' }} />
            <p>الصور المختارة: {images.length} من {planType === 'free' ? 2 : 5}</p>
            <textarea placeholder="مواصفات وتفاصيل السيارة" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={4} style={{ width: '100%', padding: '10px' }}></textarea>
            <button type="submit" disabled={formLoading} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold' }}>{formLoading ? 'جاري الحفظ...' : 'نشر الإعلان فوراً 🚀'}</button>
          </form>
        )}

        {activeTab === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>💳 بوابات تحويل واستقبال الأموال</h3>
            <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px' }}>
              <h4>PayPal</h4>
              <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={{ width: '100%', padding: '10px' }} />
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px' }}>
              <h4>Western Union</h4>
              <input type="text" value={westernName} onChange={(e) => setWesternName(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
              <input type="text" value={westernCountry} onChange={(e) => setWesternCountry(e.target.value)} style={{ width: '100%', padding: '10px' }} />
            </div>
            <button onClick={() => alert('تم التحديث!')} style={{ padding: '12px', backgroundColor: '#f59e0b', color: 'white', fontWeight: 'bold' }}>حفظ التعديلات</button>
          </div>
        )}
      </div>
    </div>
  )
}
