'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([
    { id: 1, name: 'جبال للإعلانات', email: 'admin@sayarty.store', role: 'مدير عام' },
    { id: 2, name: 'عميل تجريبي', email: 'user@sayarty.store', role: 'معلن' }
  ])
  const [activeTab, setActiveTab] = useState<'ads' | 'create_ad' | 'payment' | 'users' | 'settings'>('ads')

  // حقول السيارة الأساسية (قوائم منسدلة وخيارات)
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [mileageRange, setMileageRange] = useState('')
  const [extraInfo, setExtraInfo] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [formLoading, setFormLoading] = useState(false)

  // خيارات الدفع وإعدادات الصيانة
  const [paypalEmail, setPaypalEmail] = useState('jebal.payments@gmail.com')
  const [westernName, setWesternName] = useState('Jebal Ads Company')
  const [westernCountry, setWesternCountry] = useState('Yemen')
  const [isMaintenance, setIsMaintenance] = useState(false)

  const fetchAds = () => {
    fetch('/api/ads').then((res) => res.json()).then((data) => {
      if (Array.isArray(data)) setAds(data)
    }).catch(() => {})
  }

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      alert('الرجاء تسجيل الدخول أولاً.')
      router.push('/login')
    } else {
      fetchAds()
      // استعادة إعدادات الدفع والصيانة المحفوظة إن وجدت
      const savedPaypal = localStorage.getItem('paypalEmail')
      const savedWName = localStorage.getItem('westernName')
      const savedWCountry = localStorage.getItem('westernCountry')
      const savedMaint = localStorage.getItem('isMaintenance')
      if (savedPaypal) setPaypalEmail(savedPaypal)
      if (savedWName) setWesternName(savedWName)
      if (savedWCountry) setWesternCountry(savedWCountry)
      if (savedMaint) setIsMaintenance(savedMaint === 'true')
    }
  }, [])

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('paypalEmail', paypalEmail)
    localStorage.setItem('westernName', westernName)
    localStorage.setItem('westernCountry', westernCountry)
    localStorage.setItem('isMaintenance', String(isMaintenance))
    alert('تم حفظ إعدادات الدفع والنظام بنجاح!')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) return alert('الحد الأقصى 5 صور!')
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
    await fetch('/api/ads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: nextStatus }) })
    fetchAds()
  }

  const handleDeleteAd = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف الإعلان؟')) {
      await fetch(`/api/ads?id=${id}`, { method: 'DELETE' })
      fetchAds()
    }
  }

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newPrice || !brand || !year || !mileageRange) return alert('الرجاء ملء الحقول المطلوبة')
    setFormLoading(true)
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, price: Number(newPrice), description: newDesc, brand, model, year: Number(year), color, mileage: mileageRange, extra_info: extraInfo, image_url: images.length > 0 ? JSON.stringify(images) : '' })
      })
      if ((await res.json()).success) {
        alert('تم نشر الإعلان بنجاح!')
        setNewTitle(''); setNewPrice(''); setNewDesc(''); setImages([]); setBrand(''); setModel(''); setYear(''); setColor(''); setMileageRange(''); setExtraInfo('');
        fetchAds(); setActiveTab('ads')
      }
    } catch { alert('حدث خطأ أثناء الاتصال بالسيرفر') } finally { setFormLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    router.push('/login')
  }

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f5f7fb', padding: '15px', boxSizing: 'border-box' }}>
      {/* القائمة العلوية للوحة التحكم */}
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#38bdf8' }}>🛠️ لوحة الإدارة المتكاملة لموقع سيارتي</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', marginBottom: '8px' }}>
          <button type="button" onClick={() => setActiveTab('ads')} style={{ padding: '10px', backgroundColor: activeTab === 'ads' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>🚗 الإعلانات ({ads.length})</button>
          <button type="button" onClick={() => setActiveTab('create_ad')} style={{ padding: '10px', backgroundColor: activeTab === 'create_ad' ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>➕ نشر إعلان</button>
          <button type="button" onClick={() => setActiveTab('payment')} style={{ padding: '10px', backgroundColor: activeTab === 'payment' ? '#f59e0b' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>💳 خيارات الدفع</button>
          <button type="button" onClick={() => setActiveTab('users')} style={{ padding: '10px', backgroundColor: activeTab === 'users' ? '#8b5cf6' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>👥 المستخدمين</button>
          <button type="button" onClick={() => setActiveTab('settings')} style={{ padding: '10px', backgroundColor: activeTab === 'settings' ? '#ec4899' : '#334155', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>⚙️ النظام والصيانة</button>
        </div>
        <button type="button" onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', marginTop: '5px' }}>🔒 تسجيل الخروج الآمن</button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        {/* 1. تبويب إدارة ومراجعة الإعلانات */}
        {activeTab === 'ads' && (
          <div>
            <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>🚗 مراجعة وإدارة إعلانات السيارات الحية</h3>
            {ads.length === 0 ? <p style={{ color: '#64748b' }}>لا توجد إعلانات معروضة حالياً.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ads.map((ad) => (
                  <div key={ad.id} style={{ padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{ad.title}</strong>
                      <div style={{ color: '#0ea5e9', fontWeight: 'bold', marginTop: '4px' }}>{ad.price} $</div>
                      <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: ad.status === 'active' ? '#dcfce7' : '#fef3c7', color: ad.status === 'active' ? '#166534' : '#92400e' }}>{ad.status === 'active' ? 'نشط وموافق عليه' : 'قيد الانتظار'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button type="button" onClick={() => handleStatusUpdate(ad.id, ad.status)} style={{ padding: '6px 12px', backgroundColor: ad.status === 'active' ? '#64748b' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px' }}>{ad.status === 'active' ? 'تعطيل' : 'تفعيل'}</button>
                      <button type="button" onClick={() => handleDeleteAd(ad.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px' }}>حذف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. تبويب إنشاء الإعلان بالقوائم المنسدلة المحدثة */}
        {activeTab === 'create_ad' && (
          <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#1e293b' }}>➕ نشر إعلان سيارة جديد بمواصفات دقيقة</h3>
            
            <input type="text" placeholder="عنوان الإعلان الافتتاحي للمشتري" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            
            <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required>
              <option value="">اختر ماركة السيارة 🔖</option>
              <option value="تويوتا">تويوتا (Toyota)</option>
              <option value="هيونداي">هيونداي (Hyundai)</option>
              <option value="نيسان">نيسان (Nissan)</option>
