'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMaint, setIsMaint] = useState(false)
  
  // حالة التحكم بالصفحة النشطة في الواجهة (home, register, forgot, profile)
  const [view, setView] = useState("home")

  // حالات حقول الإدخال لصفحة التسجيل
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPass, setRegPass] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")

  useEffect(() => {
    if (localStorage.getItem('isMaintenance') === 'true') {
      setIsMaint(true)
      setLoading(false)
      return
    }
    fetch('/api/ads').then((res) => res.json()).then((data) => {
      if (Array.isArray(data)) setAds(data.filter(ad => ad.status === 'active'))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (isMaint) {
    return (
      <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛠️</div>
        <h1 style={{ color: '#38bdf8' }}>الموقع تحت الصيانة حالياً</h1>
        <p style={{ color: '#94a3b8', maxWidth: '400px' }}>نعمل حالياً على تطوير المنصة لتقديم أفضل تجربة. سنعود للعمل قريباً جداً، شكراً لكم!</p>
      </div>
    )
  }

  const styIn = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "15px", boxSizing: "border-box" as const };

  return (
    <div style={{ fontFamily: 'sans-serif', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '15px' }}>
      
      {/* شريط التنقل العلوي الموحد لجميع الصفحات */}
      <header style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '12px', marginBottom: '20px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 onClick={() => setView("home")} style={{ color: '#38bdf8', margin: 0, fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
            🚗 موقع سيارتي
          </h1>
          
          <Link href="/dashboard" style={{ backgroundColor: '#059669', color: 'white', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
            ➕ إعلان مجاني
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #334155', fontSize: '13px', color: '#cbd5e1' }}>
          <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>دخول</Link>
          <span style={{ color: '#475569' }}>|</span>
          <span onClick={() => setView("register")} style={{ color: view === "register" ? "#38bdf8" : "#cbd5e1", cursor: "pointer", fontWeight: view === "register" ? "bold" : "normal" }}>تسجيل</span>
          <span style={{ color: '#475569' }}>|</span>
          <span onClick={() => setView("profile")} style={{ color: view === "profile" ? "#38bdf8" : "#cbd5e1", cursor: "pointer", fontWeight: view === "profile" ? "bold" : "normal" }}>حسابي</span>
          <span style={{ color: '#475569' }}>|</span>
          <span onClick={() => setView("home")} style={{ color: view === "home" ? "#38bdf8" : "#cbd5e1", cursor: "pointer" }}>الرئيسية</span>
        </div>
      </header>

      {/* العرض الديناميكي للمحتوى بناءً على الزر المختار */}
      
      {/* أولاً: عرض الواجهة الرئيسية والسيارات */}
      {view === "home" && (
        <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {loading ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>جاري التحميل...</p> : ads.length === 0 ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>لا توجد سيارات معروضة.</p> : ads.map((ad) => {
            let imgs: string[] = []
            try { if (ad.image_url) imgs = JSON.parse(ad.image_url) } catch { if (ad.image_url) imgs = [ad.image_url] }
            return (
              <div key={ad.id} style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: '180px', backgroundColor: '#cbd5e1' }}>
                  {imgs.length > 0 ? <img src={imgs[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>📸 بلا صور</div>}
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>{ad.title}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '4px', fontSize: '12px' }}>
                    <div>🔖 <strong>الماركة:</strong> {ad.brand || 'عام'}</div>
                    <div>🚘 <strong>الفئة:</strong> {ad.model || 'عام'}</div>
                    <div>📅 <strong>السنة:</strong> {ad.year || 'غير محدد'}</div>
                    <div>🎨 <strong>اللون:</strong> {ad.color || 'غير محدد'}</div>
                    <div style={{ gridColumn: 'span 2' }}>🛣️ <strong>الممشى:</strong> {ad.mileage || 'غير محدد'}</div>
                  </div>
                  {ad.extra_info && <div style={{ backgroundColor: '#f0f9ff', padding: '6px', borderRadius: '4px', fontSize: '12px', color: '#0369a1' }}>📋 {ad.extra_info}</div>}
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>{ad.price} $</span>
                  </div>
                </div>
              </div>
            )
          })}
        </main>
      )}

      {/* ثانياً: عرض واجهة إنشاء حساب جديد */}
      {view === "register" && (
        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
          <div style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "12px", border: "1px solid #eee", width: "100%", maxWidth: "400px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#0f172a" }}>إنشاء حساب جديد</h2>
            <form onSubmit={(e) => { e.preventDefault(); alert("🎉 تم إنشاء الحساب بنجاح!"); setView("home"); }}>
              <input type="text" placeholder="الاسم الكامل" required value={regName} onChange={(e) => setRegName(e.target.value)} style={styIn} />
              <input type="email" placeholder="البريد الإلكتروني" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} style={styIn} />
              <input type="password" placeholder="كلمة السر" required value={regPass} onChange={(e) => setRegPass(e.target.value)} style={styIn} />
              <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>تسجيل الحساب</button>
            </form>
            <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px", color: "#64748b" }}>
              نسيت كلمة السر؟ <span onClick={() => setView("forgot")} style={{ color: "#2563eb", fontWeight: "bold", cursor: "pointer" }}>استعادة الحساب</span>
            </p>
          </div>
        </div>
      )}

      {/* ثالثاً: عرض واجهة نسيت كلمة السر */}
      {view === "forgot" && (
        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
          <div style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "12px", border: "1px solid #eee", width: "100%", maxWidth: "400px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#0f172a" }}>استعادة كلمة السر</h2>
            <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "20px" }}>أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة السر الخاصة بك.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("✉️ تم إرسال الرابط لبريدك!"); setView("register"); }}>
              <input type="email" placeholder="بريدك الإلكتروني المسجل" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} style={styIn} />
              <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>إرسال رابط الاستعادة</button>
            </form>
          </div>
        </div>
      )}

      {/* رابعاً: عرض واجهة حساب المستخدم الشخصي */}
      {view === "profile" && (
        <div style={{ maxWidth: "600px", margin: "0 auto", spaceY: "15px" }}>
          <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "20px", borderRadius: "12px", textAlign: "center", marginBottom: "15px" }}>
            <h2 style={{ margin: 0 }}>👤 حسابي الشخصي</h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "5px 0 0 0" }}>مرحباً بك في موقع سيارتي</p>
          </div>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "15px" }}>
            <h3 style={{ marginTop: 0, color: "#1e293b", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>البيانات الشخصية</h3>
