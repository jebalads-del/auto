cd ~/auto
cat > app/page.tsx << 'EOF'
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home"); 

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // تحميل الإعلانات (اختياري)
    setLoading(false);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setSuccess('تم إرسال كود التحقق بنجاح!')
        setView("otp")
      } else {
        setError(data.error || 'خطأ في التسجيل')
      }
    } catch { setError('خطأ في الاتصال') } finally { setLoading(false) }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      if (response.ok) {
        alert('🎉 تم تفعيل الحساب بنجاح!')
        window.location.href = '/login'
      } else { setError('كود التحقق خاطئ') }
    } catch { setError('خطأ في التحقق') } finally { setLoading(false) }
  }

  const styIn = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px", boxSizing: "border-box" as const };

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '15px', textAlign: 'right' }}>
      <header style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '12px', marginBottom: '20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 onClick={() => setView("home")} style={{ color: '#38bdf8', margin: 0, fontSize: '18px', cursor: 'pointer' }}>🚗 سيارتي</h1>
          <Link href="/dashboard" style={{ backgroundColor: '#059669', color: 'white', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>➕ إعلان مجاني</Link>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '12px', color: '#cbd5e1' }}>
          <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>دخول</Link><span>|</span>
          <span onClick={() => setView("reg")} style={{ cursor: "pointer", color: view==="reg"?"#38bdf8":"#fff" }}>تسجيل</span>
        </div>
      </header>

      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>❌ {error}</div>}
      {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>✅ {success}</div>}

      {view === "home" && <main style={{ textAlign: 'center', padding: '20px' }}>قائمة السيارات والموقع الرئيسي جاهز...</main>}

      {view === "reg" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <form onSubmit={handleRegister} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", width: "100%", maxWidth: "350px" }}>
            <h3>إنشاء حساب جديد</h3>
            <input placeholder="الاسم" value={name} onChange={e=>setName(e.target.value)} style={styIn} required />
            <input type="email" placeholder="البريد" value={email} onChange={e=>setEmail(e.target.value)} style={styIn} required />
            <input type="password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} style={styIn} required />
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", backgroundColor: loading ? "#93c5fd" : "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "جاري..." : "تسجيل"}
            </button>
          </form>
        </div>
      )}

      {view === "otp" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <form onSubmit={handleVerifyOtp} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", width: "100%", maxWidth: "350px" }}>
            <h3>التحقق من البريد</h3>
            <p style={{ textAlign: 'center', color: '#666' }}>الكود أُرسل إلى: <strong>{email}</strong></p>
            <input type="text" placeholder="أدخل الكود (6 أرقام)" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6} style={styIn} required />
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", backgroundColor: loading ? "#93c5fd" : "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", marginBottom: "10px" }}>
              {loading ? "جاري..." : "✅ تحقق"}
            </button>
            <button type="button" onClick={() => setView("reg")} style={{ width: "100%", padding: "10px", backgroundColor: "#e5e7eb", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              ← العودة
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
EOF
