'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ads' | 'users' | 'settings'>('ads')

  // مصفوفة وهمية للمستخدمين حتى نقوم بإنشاء جدولهم في Neon لاحقاً
  const mockUsers = [
    { id: 1, name: 'جبال للإعلانات', email: 'jebal.ads@gmail.com', role: 'مدير النظام' },
    { id: 2, name: 'أحمد علي', email: 'ahmed@email.com', role: 'مستخدم' }
  ]

  useEffect(() => {
    // جلب الإعلانات الحقيقية من قاعدة بيانات Neon
    fetch('/api/ads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAds(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fb' }}>
      
      {/* القائمة الجانبية للوحة التحكم (Sidebar) */}
      <div style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', padding: '20px', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#38bdf8' }}>🛠️ لوحة التحكم</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('ads')}
            style={{ padding: '12px', textAlign: 'right', backgroundColor: activeTab === 'ads' ? '#0f172a' : 'transparent', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: activeTab === 'ads' ? 'bold' : 'normal' }}
          >
            🚗 إدارة الإعلانات ({ads.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ padding: '12px', textAlign: 'right', backgroundColor: activeTab === 'users' ? '#0f172a' : 'transparent', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: activeTab === 'users' ? 'bold' : 'normal' }}
          >
            👥 قائمة المستخدمين
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            style={{ padding: '12px', textAlign: 'right', backgroundColor: activeTab === 'settings' ? '#0f172a' : 'transparent', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}
          >
            ⚙️ إعدادات الموقع
          </button>
          <hr style={{ border: '0', borderTop: '1px solid #334155', margin: '20px 0' }} />
          <Link href="/" style={{ padding: '12px', color: '#cbd5e1', textDecoration: 'none', fontSize: '16px' }}>
            🏠 العودة للموقع الرئيسي
          </Link>
        </div>
      </div>

      {/* المحتوى الرئيسي المتغير حسب القسم (Main Content) */}
      <div style={{ flex: 1, padding: '30px', boxSizing: 'border-box' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <h1 style={{ color: '#334155', margin: 0 }}>
            {activeTab === 'ads' && 'إدارة إعلانات السيارات الحية'}
            {activeTab === 'users' && 'إدارة مستخدمي النظام'}
            {activeTab === 'settings' && 'إعدادات الموقع العامة'}
          </h1>
          <div style={{ color: '#64748b' }}>مرحباً، <strong style={{ color: '#0f172a' }}>jebal.ads</strong></div>
        </header>

        {/* 1. قسم الإعلانات */}
        {activeTab === 'ads' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>جاري سحب الإعلانات من Neon...</p>
            ) : ads.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>لا توجد إعلانات مسجلة في قاعدة البيانات حالياً.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', color: '#64748b' }}>العنوان</th>
                    <th style={{ padding: '12px', color: '#64748b' }}>السعر</th>
                    <th style={{ padding: '12px', color: '#64748b' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr key={ad.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '12px', color: '#334155', fontWeight: 'bold' }}>{ad.title}</td>
                      <td style={{ padding: '12px', color: '#0ea5e9', fontWeight: 'bold' }}>{ad.price}</td>
                      <td style={{ padding: '12px' }}>
                        <button 
                          onClick={() => router.push(`/dashboard/edit/${ad.id}`)}
                          style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          تعديل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 2. قسم المستخدمين */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', color: '#64748b' }}>الاسم</th>
                  <th style={{ padding: '12px', color: '#64748b' }}>البريد الإلكتروني</th>
                  <th style={{ padding: '12px', color: '#64748b' }}>الصلاحية</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px', color: '#334155' }}>{user.name}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}><span style={{ backgroundColor: user.id === 1 ? '#dcfce7' : '#f1f5f9', color: user.id === 1 ? '#15803d' : '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>{user.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. قسم الإعدادات */}
        {activeTab === 'settings' && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '500px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>اسم الموقع العربي:</label>
              <input type="text" defaultValue="سيارتي ستور" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>حالة الصيانة السحابية:</label>
              <select style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                <option>تعمل بشكل طبيعي (Live)</option>
                <option>وضع الصيانة (Maintenance)</option>
              </select>
            </div>
            <button style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ الإعدادات العامة</button>
          </div>
        )}

      </div>
    </div>
  )
}
