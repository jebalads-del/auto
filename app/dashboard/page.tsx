"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("ads");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [color, setColor] = useState("");
  const [details, setDetails] = useState("");
  const [adsList, setAdsList] = useState<any[]>([]);
  const [paypal, setPaypal] = useState("");
  const [wName, setWName] = useState("");
  const [wCountry, setWCountry] = useState("");
  const [wPhone, setWPhone] = useState("");

  const data: { [key: string]: string[] } = {
    "تويوتا": ["كامري", "كورولا", "لاندكروزر"],
    "مرسيدس": ["C-Class", "E-Class", "S-Class"],
    "بي إم دبليو": ["الفئة 3", "الفئة 5", "X5"],
    "نيسان": ["صني", "ألتيما", "باترول"],
    "هيونداي": ["إلنترا", "سوناتا", "توسان"]
  };

  useEffect(() => {
    fetch("/api/ads").then(r => r.json()).then(d => setAdsList(Array.isArray(d) ? d : [])).catch(e => console.log(e));
    fetch("/api/settings").then(r => r.json()).then(d => {
      if(d) { setPaypal(d.paypal_email||""); setWName(d.western_name||""); setWCountry(d.western_country||""); setWPhone(d.western_phone||""); }
    }).catch(e => console.log(e));
  }, []);

  async function handlePublish() {
    if (!brand || !model || !price || !year) return alert("امْلأ الحقول الأساسية");
    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, model, price: parseFloat(price), year: parseInt(year), kilometers, color, details, name: `${brand} ${model}` })
    });
    if (res.ok) { alert("🚗 تم النشر!"); fetch("/api/ads").then(r => r.json()).then(d => setAdsList(Array.isArray(d) ? d : [])); }
  }

  async function handleSave() {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paypal_email: paypal, western_name: wName, western_country: wCountry, western_phone: wPhone })
    });
    if (res.ok) alert("⚙️ تم حفظ الإعدادات!");
  }

  const styIn = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px", boxSizing: "border-box" as const };

  return (
    <div style={{ direction: "rtl", textAlign: "right", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", textAlign: "center" }}>
        <h2>🛠️ لوحة التحكم الحية</h2>
        <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
          <button onClick={() => setTab("ads")} style={{ flex: 1, padding: "8px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px" }}>🚗 إنشاء إعلان</button>
          <button onClick={() => setTab("list")} style={{ flex: 1, padding: "8px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>📋 الإعلانات ({adsList.length})</button>
          <button onClick={() => setTab("pay")} style={{ flex: 1, padding: "8px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>⚙️ الدفع</button>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #eee" }}>
        {tab === "ads" && (
          <div>
            <h3>إضافة إعلان جديد</h3>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} style={styIn}>
              <option value="">اختر الماركة</option>
              {Object.keys(data).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} style={styIn}>
              <option value="">اختر الموديل</option>
              {brand && data[brand].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="number" placeholder="السعر ($) - يدوي" value={price} onChange={(e) => setPrice(e.target.value)} style={styIn} />
            <select value={year} onChange={(e) => setYear(e.target.value)} style={styIn}>
              <option value="">اختر السنة</option>
              {Array.from({ length: 27 }, (_, i) => String(2026 - i)).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={kilometers} onChange={(e) => setKilometers(e.target.value)} style={styIn}>
              <option value="">المسافة المقطوعة</option>
              <option value="0 (وكالة)">0 (وكالة)</option>
              <option value="1-50 ألف كم">1-50 ألف كم</option>
              <option value="50-100 ألف كم">50-100 ألف كم</option>
              <option value="+100 ألف كم">+100 ألف كم</option>
            </select>
            <select value={color} onChange={(e) => setColor(e.target.value)} style={styIn}>
              <option value="">اختر اللون</option>
              <option value="أبيض">أبيض</option>
              <option value="أسود">أسود</option>
              <option value="فضي">فضي</option>
              <option value="رمادي">رمادي</option>
            </select>
            <textarea placeholder="معلومات إضافية..." rows={3} value={details} onChange={(e) => setDetails(e.target.value)} style={styIn}></textarea>
            <button onClick={handlePublish} style={{ width: "100%", padding: "12px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold" }}>نشر الإعلان فعلياً</button>
          </div>
        )}

        {tab === "list" && (
          <div>
            <h3>الإعلانات بموقعك</h3>
            {adsList.length === 0 ? <p>لا توجد إعلانات حالياً.</p> : adsList.map((ad: any, i: number) => (
              <div key={i} style={{ padding: "10px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "8px" }}>
                <b>{ad.name || `${ad.brand} ${ad.model}`}</b> - <span style={{ color: "#2563eb" }}>${ad.price}</span>
                <div style={{ fontSize: "12px", color: "#666" }}>السنة: {ad.year} | اللون: {ad.color || "غير محدد"}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "pay" && (
          <div>
            <h3>إعدادات بوابات الدفع</h3>
            <input placeholder="حساب PayPal المستلم" value={paypal} onChange={(e) => setPaypal(e.target.value)} style={styIn} />
            <h4>Western Union</h4>
            <input placeholder="اسم المستلم الكامل" value={wName} onChange={(e) => setWName(e.target.value)} style={styIn} />
            <input placeholder="الدولة والمدينة" value={wCountry} onChange={(e) => setWCountry(e.target.value)} style={styIn} />
            <input placeholder="رقم الهاتف" value={wPhone} onChange={(e) => setWPhone(e.target.value)} style={styIn} />
            <button onClick={handleSave} style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold" }}>حفظ الإعدادات كاملة</button>
          </div>
        )}
      </div>
    </div>
  );
}
