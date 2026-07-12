'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ads' | 'create_ad' | 'payment'>('ads')

  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [mileageRange, setMileageRange] = useState('')
  const [extraInfo, setExtraInfo] = useState('')

  const [planType, setPlanType] = useState<'free' | 'paid'>('free')
  const [images, setImages] = useState<string[]>([])
  const [formLoading, setFormLoading] = useState(false)

  const fetchAds = () => {
    setLoading(true)
    fetch('/api/ads').then((res) => res.json()).then((data) => {
      if (Array.isArray(data)) setAds(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      alert('الرجاء تسجيل الدخول أولاً.')
      router.push('/login')
    } else {
      fetchAds()
    }
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const maxAllowed = planType === 'free' ? 2 : 5
    if (images.length + files.length > maxAllowed) return alert('تجاوزت حد الصور!')
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleStatusUpdate = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'active' : 'pending'
    fetch('/api/ads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: nextStatus }) }).then(() => fetchAds())
  }

  const handleDeleteAd = async (id: number) => {
    if (confirm('هل أنت متأكد؟')) fetch(`/api/ads?id=${id}`, { method: 'DELETE' }).then(() => fetchAds())
  }

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice || !brand || !year || !mileageRange) return alert('ملء الحقول المطلوبة')
    setFormLoading(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, price: Number(newPrice), description: newDesc, brand, model, year: Number(year), color, mileage: mileageRange, extra_info: extraInfo, image_url: images.length > 0 ? JSON.stringify(images) : '' })
      })
      if ((await res.json()).success) {
        alert('تم النشر بنجاح!')
        setNewTitle(''); setNewPrice(''); setNewDesc(''); setImages([]); setBrand(''); setModel(''); setYear(''); setColor(''); setMileageRange(''); setExtraInfo('');
        fetchAds(); setActiveTab('ads')
      }
    } catch { alert('خطأ') } finally { setFormLoading(false) }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f5f7fb', padding: '15px' }}>
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#38bdf8' }}>🛠️ لوحة تحكم الإدارة</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button type="button" onClick={() => setActiveTab('ads')} style={{ padding: '10px', backgroundColor: activeTab === 'ads' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>🚗 الإعلانات ({ads.length})</button>
          <button type="button" onClick={() => setActiveTab('create_ad')} style={{ padding: '10px', backgroundColor: activeTab === 'create_ad' ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>➕ إنشاء إعلان</button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px' }}>
        {activeTab === 'ads' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ads.map((ad) => (
              <div key={ad.id} style={{ padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>{ad.title}</strong><div style={{ color: '#0ea5e9' }}>{ad.price} $</div></div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" onClick={() => handleStatusUpdate(ad.id, ad.status)} style={{ padding: '6px 10px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px' }}>{ad.status === 'active' ? 'تعطيل' : 'موافقة'}</button>
                  <button type="button" onClick={() => handleDeleteAd(ad.id)} style={{ padding: '6px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3>➕ نشر إعلان سيارة جديد</h3>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%', padding: '10px' }} required>
              <option value="">اختر ماركة السيارة</option>
              <option value="تويوتا">تويوتا (Toyota)</option>
              <option value="هيونداي">هيونداي (Hyundai)</option>
              <option value="نيسان">نيسان (Nissan)</option>
              <option value="كيا">كيا (Kia)</option>
              <option value="آخر">ماركة أخرى</option>
            </select>
            <input type="text" placeholder="الموديل أو الفئة" value={model} onChange={(e) => setModel(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            <input type="number" placeholder="سنة الصنع" value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            <input type="text" placeholder="اللون الخارجي" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <select value={mileageRange} onChange={(e) => setMileageRange(e.target.value)} style={{ width: '100%', padding: '10px' }} required>
              <option value="">اختر الممشى الحالي</option>
              <option value="0 كم (وكالة)">0 كم (وكالة)</option>
              <option value="أقل من 50,000 كم">أقل من 50,000 كم</option>
              <option value="50,000 - 100,000 كم">50,000 - 100,000 كم</option>
              <option value="أكثر من 100,000 كم">أكثر من 100,000 كم</option>
            </select>
            <input type="number" placeholder="السعر المطلوب ($)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ width: '100%', padding: '10px' }} />
            <textarea placeholder="الوصف العام للسيارة" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}></textarea>
            <textarea placeholder="📋 صندوق ميزات ومعلومات إضافية (فتحة سقف، شاشة...)" value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', border: '2px dashed #0ea5e9', borderRadius: '4px', backgroundColor: '#f0f9ff' }}></textarea>
            <button type="submit" disabled={formLoading} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '6px' }}>{formLoading ? 'جاري النشر...' : 'نشر الإعلان'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
