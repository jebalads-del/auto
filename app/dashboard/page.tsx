'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ads' | 'create_ad' | 'payment'>('ads')

  // الحقول القديمة والجديدة لإعلان السيارة
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [mileage, setMileage] = useState('')
  const [extraInfo, setExtraInfo] = useState('')

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

  const handleStatusUpdate = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'active' : 'pending'
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus })
      })
      if (res.ok) {
        alert('تم تحديث حالة الإعلان بنجاح!')
        fetchAds()
      }
    } catch {
      alert('فشل التحديث')
    }
  }

  const handleDeleteAd = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return
    try {
      const res = await fetch(`/api/ads?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        alert('تم حذف الإعلان بنجاح!')
        fetchAds()
      }
    } catch {
      alert('فشل الحذف')
    }
  }

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice) return alert('الرجاء كتابة العنوان والسعر')
    setFormLoading(true)
    try {
      // إرسال كافة تفاصيل السيارة الجديدة إلى السيرفر
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle, 
          price: Number(newPrice), 
          description: newDesc,
          brand: brand,
          model: model,
          year: Number(year),
          color: color,
          mileage: Number(mileage),
          extra_info: extraInfo,
          image_url: images.length > 0 ? JSON.stringify(images) : ''
        })
      })
      const result = await res.json()
      if (result.success) {
        alert('تم نشر الإعلان بنجاح! هو الآن قيد المراجعة الإدارية للموافقة عليه واظهاره.')
        setNewTitle(''); setNewPrice(''); setNewDesc(''); setImages([]);
        setBrand(''); setModel(''); setYear(''); setColor(''); setMileage(''); setExtraInfo('');
        fetchAds(); setActiveTab('ads')
      } else { alert('فشل النشر') }
    } catch { alert('خطأ في الاتصال') } finally { setFormLoading(false) }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f5f7fb', padding: '15px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#38bdf8' }}>🛠️ لوحة تحكم الإدارة والموافقة</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button onClick={() => setActiveTab('ads')} style={{ padding: '10px', backgroundColor: activeTab === 'ads' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>🚗 الإعلانات المرفوعة ({ads.length})</button>
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
            <h3>إدارة ومراجعة إعلانات السيارات الحية</h3>
            {loading ? <p>جاري التحميل...</p> : ads.length === 0 ? <p>لا توجد إعلانات معروضة حالياً.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ads.map((ad) => (
                  <div key={ad.id} style={{ padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{ad.title}</strong>
                      <div style={{ color: '#0ea5e9' }}>{ad.price} $</div>
                      <div style={{ fontSize: '12px', color: ad.status === 'active' ? 'green' : 'orange', fontWeight: 'bold' }}>الحالة: {ad.status === 'active' ? 'موافق عليه ونشط' : 'قيد المراجعة'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleStatusUpdate(ad.id, ad.status)} style={{ padding: '6px 10px', backgroundColor: ad.status === 'active' ? '#64748b' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px' }}>
                        {ad.status === 'active' ? 'تعطيل' : 'موافقة'}
                      </button>
                      <button onClick={() => handleDeleteAd(ad.id)} style={{ padding: '6px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create_ad' && (
          <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3>➕ نشر إعلان سيارة جديد</h3>
            <select value={planType} onChange={(e) => { setPlanType(e.target.value as 'free' | 'paid'); setImages([]); }} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="free">باقة مجانية (حد أقصى 2 صور)</option>
              <option value="paid">باقة مدفوعة متميزة (حد أقصى 5 صور)</option>
            </select>
            
            <input type="text" placeholder="عنوان السيارة" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} required />
            
            {/* الحقول المضافة حديثاً بتنسيق مطابق لموقعك */}
            <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required>
              <option value="">اختر ماركة السيارة</option>
              <option value="toyota">تويوتا</option>
              <option value="hyundai">هيونداي</option>
              <option value="nissan">نيسان</option>
              <option value="kia">كيا</option>
              <option value="mercedes">مرسيدس</option>
              <option value="bmw">بي إم دبليو</option>
            </select>

            <input type="text" placeholder="الموديل (مثال: كامري، النترا)" value={model} onChange={(e) => setModel(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} required />
            
            <input type="number" placeholder="سنة الصنع (مثال: 2024)" value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} required />
            
            <input type="text" placeholder="اللون الخارجي" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
            
            <input type="number" placeholder="المسافة المقطوعة بالكيلومترات (الممشى)" value={mileage} onChange={(e) => setMileage(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} required />

