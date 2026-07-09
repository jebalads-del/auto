'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Ad {
  id: number
  title: string
  description: string
  price: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn] = useState(true)

  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        setAds(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err)
        setLoading(false)
      })
  }, [])

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>يجب تسجيل الدخول أولاً</h1>
        <Link href="/login">اذهب لتسجيل الدخول</Link>
      </div>
    )
  }

  const totalAds = ads.length
  const activeUsers = 45
  const totalSales = "2.5M"

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', direction: 'rtl' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #0070f3', paddingBottom: '20px' }}>
        <h1>📊 لوحة التحكم</h1>
        <nav>
          <Link href="/" style={{ marginLeft: '20px', color: '#0070f3', fontWeight: 'bold', textDecoration: 'none' }}>الرئيسية</Link>
          <Link href="/login" style={{ color: '#e74c3c', fontWeight: 'bold', textDecoration: 'none' }}>تسجيل خروج</Link>
        </nav>
      </header>

      <div style={{ marginBottom: '40px' }}>
        <h2>الإحصائيات</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0f8ff' }}>
            <h3 style={{ color: '#0070f3', marginBottom: '10px' }}>إجمالي الإعلانات</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#0070f3', margin: 0 }}>{loading ? "..." : totalAds}</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0fff0' }}>
            <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>المستخدمون النشطون</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>{activeUsers}</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff8f0' }}>
            <h3 style={{ color: '#e67e22', marginBottom: '10px' }}>إجمالي المبيعات</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#e67e22', margin: 0 }}>{totalSales}</p>
          </div>
        </div>
      </div>

      <div>
        <h2>الإعلانات الحالية في قاعدة البيانات</h2>
        {loading ? (
          <p>جاري تحميل جدول الإعلانات...</p>
        ) : ads.length === 0 ? (
          <p>لا توجد بيانات متاحة في قاعدة البيانات حالياً.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الاسم</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>السعر</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الحالة</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, index) => (
                <tr key={ad.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{ad.title}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{ad.price}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd', color: index % 3 === 2 ? '#e67e22' : '#27ae60', fontWeight: 'bold' }}>
                    {index % 3 === 2 ? "⏳ قيد المراجعة" : "✓ نشط"}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <button 
                      onClick={() => router.push(`/dashboard/edit/${ad.id}`)}
                      style={{ 
                        backgroundColor: index % 3 === 2 ? '#e67e22' : '#0070f3', 
                        color: 'white', 
                        padding: '6px 12px', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}
                    >
                      {index % 3 === 2 ? 'مراجعة' : 'تعديل'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
