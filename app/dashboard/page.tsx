'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ads' | 'users' | 'settings'>('ads')

  const mockUsers = [
    { id: 1, name: 'جبال للإعلانات', email: 'jebal.ads@gmail.com', role: 'مدير النظام' },
    { id: 2, name: 'أحمد علي', email: 'ahmed@email.com', role: 'مستخدم' }
  ]

  useEffect(() => {
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
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f5f7fb', padding: '15px', boxSizing: 'border-box' }}>
      
      {/* شريط الأقسام العلوي المتجاوب مع الهاتف بدلاً من القائمة الجانبية */}
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#38bdf8', fontSize: '20px' }}>🛠️ لوحة تحكم سيارتي</h2>
        
        {/* أزرار الأقسام على هيئة روابط أفقية متناسقة القياس */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('ads')}
              style={{ padding: '10px', textAlign: 'center', backgroundColor: activeTab === 'ads' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              🚗 الإعلانات ({ads.length})
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              style={{ padding: '10px', textAlign: 'center', backgroundColor: activeTab === 'users' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              👥 المستخدمين
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{ padding: '10px', textAlign: 'center', backgroundColor: activeTab === 'settings' ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              ⚙️ الإعدادات
            </button>
            <Link href="/" style={{ padding: '10px', textAlign: 'center', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
              🏠 الخروج للموقع
            </Link>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي أسفل الأقسام العلوية */}
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <header style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <h3 style={{ color: '#334155', margin: '0 0 5px 0', fontSize: '18px' }}>
            {activeTab === 'ads' && 'إدارة إعلانات السيارات الحية'}
            {activeTab === 'users' && 'إدارة مستخدمي النظام'}
            {activeTab === 'settings' && 'إعدادات الموقع العامة'}
          </h3>
          <div style={{ color: '#64748b', fontSize: '13px' }}>المشرف المتصل: <strong style={{ color: '#0f172a' }}>jebal.ads</strong></div>
        </header>

        {/* 1. قسم الإعلانات */}
        {activeTab === 'ads' && (
          <div>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>جاري سحب البيانات...</p>
            ) : ads.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '14px' }}>لا توجد إعلانات مسجلة في قاعدة البيانات حالياً.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ads.map((ad) => (
                  <div key={ad.id} style={{ padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#334155', fontWeight: 'bold', fontSize: '15px' }}>{ad.title}</div>
                      <div style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '13px', marginTop: '4px' }}>{ad.price}</div>
                    </div>
                    <button 
                      onClick={() => router.push(`/dashboard/edit/${ad.id}`)}
                      style={{ padding: '6px 12px', backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      تعديل
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. قسم المستخدمين */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mockUsers.map((user) => (
              <div key={user.id} style={{ padding: '12px', border: '1px solid #edf2f7', borderRadius: '6px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#334155', fontWeight: 'bold', fontSize: '15px' }}>{user.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{user.email}</div>
                </div>
                <span style={{ backgroundColor: user.id === 1 ? '#dcfce7' : '#e2e8f0', color: user.id === 1 ? '#15803d' : '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 3. قسم الإعدادات */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>اسم الموقع العربي:</label>
              <input type="text" defaultValue="سيارتي ستور" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>حالة الصيانة السحابية:</label>
              <select style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: 'white' }}>
                <option>تعمل بشكل طبيعي (Live)</option>
                <option>وضع الصيانة (Maintenance)</option>
              </select>
            </div>
            <button style={{ padding: '12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '14px' }}>
              حفظ الإعدادات العامة
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
