'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");

  useEffect(() => {
    fetch('/api/ads').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setAds(d.filter(a => a.status === 'active'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
          <span onClick={() => setView("reg")} style={{ cursor: "pointer", color: view==="reg"?"#38bdf8":"#fff" }}>تسجيل</span><span>|</span>
          <span onClick={() => setView("prof")} style={{ cursor: "pointer", color: view==="prof"?"#38bdf8":"#fff" }}>حسابي</span><span>|</span>
          <span onClick={() => setView("home")} style={{ cursor: "pointer" }}>الرئيسية</span>
        </div>
      </header>

      {view === "home" && (
        <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {loading ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>جاري التحميل...</p> : ads.length === 0 ? <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>لا توجد سيارات.</p> : ads.map((ad) => (
            <div key={ad.id} style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', padding: '10px' }}>
              <img src={ad.image_url || ""} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', backgroundColor: '#cbd5e1', borderRadius: '6px' }} />
              <h3 style={{ margin: '8px 0', fontSize: '15px' }}>{ad.title}</h3>
              <div style={{ fontSize: '12px', color: '#555', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '4px' }}>
                <div>🔖 {ad.brand} | 🚘 {ad.model} | 📅 {ad.year}</div>
                <div>🎨 اللون: {ad.color} | 🛣️ العداد: {ad.mileage} كم</div>
              </div>
              <div style={{ marginTop: '8px', fontWeight: 'bold', color: '#10b981', fontSize: '16px' }}>{ad.price} $</div>
            </div>
          ))}
        </main>
      )}

      {view === "reg" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", width: "100%", maxWidth: "350px" }}>
            <h3 style={{ textAlign: "center", margin: "0 0 15px 0" }}>إنشاء حساب جديد</h3>
            <input placeholder="الاسم الكامل" style={styIn} /><input placeholder="البريد" style={styIn} /><input type="password" placeholder="كلمة السر" style={styIn} />
            <button onClick={() => { alert("🎉 تم التسجيل!"); setView("home"); }} style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold" }}>سجل الآن</button>
            <p style={{ textAlign: "center", fontSize: "12px", marginTop: "10px" }}>نسيت كلمة السر؟ <span onClick={() => setView("forg")} style={{ color: "#2563eb", cursor: "pointer" }}>استعادة</span></p>
          </div>
        </div>
      )}

      {view === "forg" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", width: "100%", maxWidth: "350px" }}>
            <h3 style={{ textAlign: "center" }}>استعادة كلمة السر</h3>
            <input placeholder="بريدك الإلكتروني" style={styIn} />
            <button onClick={() => { alert("✉️ تم إرسال الرابط!"); setView("reg"); }} style={{ width: "100%", padding: "10px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "8px" }}>إرسال الرابط</button>
          </div>
        </div>
      )}

      {view === "prof" && (
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "15px" }}>
            <h4>👤 حسابي الشخصي</h4>
            <p style={{ fontSize: "13px" }}><b>الاسم:</b> مستخدم تجريبي<br/><b>البريد:</b> user@sayarty.store</p>
          </div>
          <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #eee" }}>
            <p style={{ fontSize: "13px", color: "#666" }}>لم تنشر أي إعلانات سيارات بعد.</p>
            <button onClick={() => setView("home")} style={{ padding: "8px 12px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "6px" }}>تصفح المعرض</button>
          </div>
        </div>
      )}
    </div>
  )
}
