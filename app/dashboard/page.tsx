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

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (isAdmin !== 'true') {
      alert('غير مسموح لك بالدخول! الرجاء تسجيل الدخول أولاً.')
      router.push('/login')
    } else {
      fetchAds()
    }
  }, [])

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
    if (!newTitle || !newPrice || !brand || !year || !mileageRange) {
      return alert('الرجاء ملء الحقول الأساسية: العنوان، السعر، الماركة، السنة، والممشى')
    }
    setFormLoading(true)
    try {
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
          mileage: mileageRange, 
          extra_info: extraInfo,
          image_url: images.length > 0 ? JSON.stringify(images) : ''
        })
      })
      const result = await res.json()
      if (result.success) {
        alert('تم نشر الإعلان بنجاح! هو الآن قيد المراجعة الإدارية.')
        setNewTitle(''); setNewPrice(''); setNewDesc(''); setImages([]);
        setBrand(''); setModel(''); setYear(''); setColor(''); setMileageRange(''); setExtraInfo('');
        fetchAds(); setActiveTab('ads')
      } else { alert('فشل النشر') }
    } catch { alert('خطأ في الاتصال') } finally { setFormLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    router.push('/login')
  }

  const yearsArray = Array.from(new Array(28), (val, index) => 2027 - index);

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f5f7fb', padding: '15px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#38bdf8' }}>🛠️ لوحة تحكم الإدارة والموافقة</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <button type="button" onClick={() => setActiveTab('ads')} style={{ padding: '10px', backgroundColor: activeTab === 'ads' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>🚗 الإعلانات المرفوعة ({ads.length})</button>
          <button type="button" onClick={() => setActiveTab('create_ad')} style={{ padding: '10px', backgroundColor: activeTab === 'create_ad' ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>➕ إنشاء إعلان</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button type="button" onClick={() => setActiveTab('payment')} style={{ padding: '10px', backgroundColor: activeTab === 'payment' ? '#f59e0b' : '#334155', color: 'white', border: 'none', borderRadius: '6px' }}>💳 طرق الدفع</button>
          <button type="button" onClick={handleLogout} style={{ padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🔒 تسجيل الخروج</button>
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
                      <button type="button" onClick={() => handleStatusUpdate(ad.id, ad.status)} style={{ padding: '6px 10px', backgroundColor: ad.status === 'active' ? '#64748b' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px' }}>
                        {ad.status === 'active' ? 'تعطيل' : 'موافقة'}
                      </button>
                      <button type="button" onClick={() => handleDeleteAd(ad.id)} style={{ padding: '6px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>حذف</button>
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
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>نوع باقة الإعلان:</label>
            <select value={planType} onChange={(e) => { setPlanType(e.target.value as 'free' | 'paid'); setImages([]); }} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="free">باقة مجانية (حد أقصى 2 صور)</option>
              <option value="paid">باقة مدفوعة متميزة (حد أقصى 5 صور)</option>
            </select>
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>عنوان الإعلان:</label>
            <input type="text" placeholder="مثال: تويوتا كامري 2024 نظيفة جداً للبيع" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} required />
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>الماركة:</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required>
              <option value="">اختر ماركة السيارة</option>
              <option value="تويوتا">تويوتا (Toyota)</option>
              <option value="هيونداي">هيونداي (Hyundai)</option>
              <option value="نيسان">نيسان (Nissan)</option>
              <option value="كيا">كيا (Kia)</option>
              <option value="مرسيدس">مرسيدس (Mercedes)</option>
              <option value="بي إم دبليو">بي إم دبليو (BMW)</option>
              <option value="فورد">فورد (Ford)</option>
              <option value="لكزس">لكزس (Lexus)</option>
              <option value="هوندا">هوندا (Honda)</option>
              <option value="آخر">ماركة أخرى</option>
            </select>

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
                      <button type="button" onClick={() => handleStatusUpdate(ad.id, ad.status)} style={{ padding: '6px 10px', backgroundColor: ad.status === 'active' ? '#64748b' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px' }}>
                        {ad.status === 'active' ? 'تعطيل' : 'موافقة'}
                      </button>
                      <button type="button" onClick={() => handleDeleteAd(ad.id)} style={{ padding: '6px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>حذف</button>
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
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>نوع باقة الإعلان:</label>
            <select value={planType} onChange={(e) => { setPlanType(e.target.value as 'free' | 'paid'); setImages([]); }} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="free">باقة مجانية (حد أقصى 2 صور)</option>
              <option value="paid">باقة مدفوعة متميزة (حد أقصى 5 صور)</option>
            </select>
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>عنوان الإعلان:</label>
            <input type="text" placeholder="مثال: تويوتا كامري 2024 نظيفة جداً للبيع" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} required />
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>الماركة:</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required>
              <option value="">اختر ماركة السيارة</option>
              <option value="تويوتا">تويوتا (Toyota)</option>
              <option value="هيونداي">هيونداي (Hyundai)</option>
              <option value="نيسان">نيسان (Nissan)</option>
              <option value="كيا">كيا (Kia)</option>
              <option value="مرسيدس">مرسيدس (Mercedes)</option>
              <option value="بي إم دبليو">بي إم دبليو (BMW)</option>
              <option value="فورد">فورد (Ford)</option>
              <option value="لكزس">لكزس (Lexus)</option>
              <option value="هوندا">هوندا (Honda)</option>
              <option value="آخر">ماركة أخرى</option>
            </select>

            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>الموديل أو الفئة:</label>
            <input type="text" placeholder="مثال: كامري GLX / النترا" value={model} onChange={(e) => setModel(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} required />
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>سنة الصنع:</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required>
              <option value="">اختر السنة</option>
              {yearsArray.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>اللون الخارجي:</label>
            <select value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="">اختر اللون</option>
              <option value="أبيض">أبيض</option>
              <option value="أسود">أسود</option>
              <option value="فضي">فضي</option>
              <option value="رمادي">رمادي</option>
              <option value="أحمر">أحمر</option>
              <option value="أزرق">أزرق</option>
              <option value="كحلي">كحلي</option>
              <option value="ذهبي">ذهبي</option>
              <option value="آخر">لون آخر</option>
            </select>
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>المسافة المقطوعة (الكيلومترات):</label>
            <select value={mileageRange} onChange={(e) => setMileageRange(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required>
              <option value="">اختر الممشى الحالي</option>
              <option value="0 كم (وكالة)">0 كم (وكالة)</option>
              <option value="أقل من 10,000 كم">أقل من 10,000 كم</option>
              <option value="10,000 - 30,000 كم">10,000 - 30,000 كم</option>
              <option value="30,000 - 60,000 كم">30,000 - 60,000 كم</option>
              <option value="60,000 - 100,000 كم">60,000 - 100,000 كم</option>
              <option value="100,000 - 150,000 كم">100,000 - 150,000 كم</option>
              <option value="150,000 - 200,000 كم">150,000 - 200,000 كم</option>
              <option value="أكثر من 200,000 كم">أكثر من 200,000 كم</option>
            </select>

            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>السعر المطلوب ($):</label>
            <input type="number" placeholder="السعر المطلوب" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} required />
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>صور السيارة:</label>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ width: '100%', padding: '10px' }} />
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>الصور المختارة: {images.length} من {planType === 'free' ? 2 : 5}</p>
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px' }}>الوصف العام للسيارة:</label>
            <textarea placeholder="اكتب نبذة عامة عن السيارة وحالتها للبيع..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}></textarea>
            
            <label style={{ fontWeight: 'bold', marginBottom: '-10px', color: '#0ea5e9' }}>📋 صندوق ميزات ومعلومات إضافية:</label>
            <textarea placeholder="مثال: فتحة سقف، تشغيل عن بعد، كاميرا 360، شاشة أندرويد، طقم تواير جديد، حالة الفحص صبغ وكالة..." value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', border: '2px dashed #0ea5e9', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#f0f9ff' }}></textarea>
            
            <button type="submit" disabled={formLoading} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>
              {formLoading ? 'جاري النشر...' : 'نشر الإعلان'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
