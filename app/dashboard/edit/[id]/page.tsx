'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // جلب بيانات الإعلان الحالية لتعبئة الحقول تلقائياً
    fetch(`/api/ads`)
      .then(res => res.json())
      .then(data => {
        // البحث عن السيارة المحددة داخل مصفوفة الإعلانات
        const currentAd = data.find((item: any) => item.id === Number(id))
        if (currentAd) {
          setTitle(currentAd.title)
          setPrice(currentAd.price)
          setDescription(currentAd.description || '')
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch(`/api/ads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price, description })
    })

    const result = await res.json()
    setSaving(false)

    if (result.success) {
      alert('تم حفظ التعديلات بنجاح في قاعدة البيانات!')
      router.push('/dashboard')
    } else {
      alert('حدث خطأ أثناء الحفظ.')
    }
  }

  if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>جاري تحميل بيانات الإعلان...</p>

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', direction: 'rtl' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #0070f3', paddingBottom: '10px' }}>
        <h2>✏️ تعديل بيانات الإعلان (#{id})</h2>
      </header>

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>اسم السيارة / الإعلان:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السعر (ر.س):</label>
          <input 
            type="text" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الوصف أو التفاصيل:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={4}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            type="submit" 
            disabled={saving}
            style={{ backgroundColor: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
          <Link href="/dashboard" style={{ backgroundColor: '#7f8c8d', color: 'white', padding: '10px 20px', borderRadius: '4px', textDecoration: 'none', textAlign: 'center' }}>
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
