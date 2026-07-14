"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("ads");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [color, setColor] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [adsList, setAdsList] = useState<any[]>([]);
  const [paypal, setPaypal] = useState("");
  const [wName, setWName] = useState("");
  const [wCountry, setWCountry] = useState("");
  const [wPhone, setWPhone] = useState("");
  const [img, setImg] = useState("");
  const [imgSt, setImgSt] = useState("اضغط هنا لاختيار صور السيارة");

  const data: { [key: string]: string[] } = {
    "تويوتا": ["كامري", "كورولا", "لاندكروزر"],
    "مرسيدس": ["C-Class", "E-Class", "S-Class"],
    "بي إم دبليو": ["الفئة 3", "الفئة 5", "X5"],
    "نيسان": ["صني", "ألتيما", "باترول"]
  };

  function load() {
    fetch("/api/ads").then(r => r.json()).then(d => setAdsList(Array.isArray(d) ? d : []));
    fetch("/api/settings").then(r => r.json()).then(d => {
      if(d) { setPaypal(d.paypal_email||""); setWName(d.western_name||""); setWCountry(d.western_country||""); setWPhone(d.western_phone||""); }
    });
  }
  useEffect(() => { load(); }, []);

  const handleFile = (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImgSt("جاري معالجة الصور...");
    const r = new FileReader();
    r.onloadend = () => { 
      setImg(r.result as string); 
      setImgSt(`📷 تم اختيار ${files.length} صور بنجاح!`); 
    };
    r.readAsDataURL(files[0]);
  };

  async function handlePublish() {
    if (!brand || !model || !price) return alert("امْلأ الماركة والموديل والسعر");
    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${brand} ${model} ${year}`, price: parseFloat(price), description: extraInfo, brand, model, year: parseInt(year)||2024, color, mileage: parseInt(mileage)||0, extra_info: extraInfo, image_url: img })
    });
    if (res.ok) { alert("🎉 تم النشر بنجاح!"); setBrand(""); setModel(""); setPrice(""); setImg(""); setImgSt("اضغط هنا لاختيار صور السيارة"); load(); }
  }

  async function handleApprove(id: number) {
    const res = await fetch("/api/ads", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "active" }) });
    if (res.ok) { alert("✓ تم التفعيل والنشــر!"); load(); }
  }

  async function handleDelete(id: number) {
    if (confirm("حذف؟")) fetch(`/api/ads?id=${id}`, { method: "DELETE" }).then(() => { alert("🗑️ تم الحذف!"); load(); });
  }

  async function handleSave() {
    const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paypal_email: paypal, western_name: wName, western_country: wCountry, western_phone: wPhone }) });
    if (res.ok) alert("⚙️ تم حفظ الإعدادات!");
  }

  const sty = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px", boxSizing: "border-box" as const };

  return (
    <div style={{ direction: "rtl", textAlign: "right", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", textAlign: "center" }}>
        <h2>🛠️ لوحة التحكم الحية</h2>
        <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
          <button onClick={() => setTab("ads")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "ads" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>🚗 إعلان</button>
          <button onClick={() => setTab("list")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "list" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>📋 الإعلانات ({adsList.length})</button>
          <button onClick={() => setTab("pay")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "pay" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>⚙️ الدفع</button>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #eee" }}>
        {tab === "ads" && (
          <div>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} style={sty}><option value="">الماركة</option>{Object.keys(data).map(b => <option key={b}>{b}</option>)}</select>
            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} style={sty}><option value="">الموديل</option>{brand && data[brand].map(m => <option key={m}>{m}</option>)}</select>
            <input type="number" placeholder="السعر ($)" value={price} onChange={(e) => setPrice(e.target.value)} style={sty} />
            <select value={year} onChange={(e) => setYear(e.target.value)} style={sty}><option value="">السنة</option>{Array.from({ length: 27 }, (_, i) => String(2026 - i)).map(y => <option key={y}>{y}</option>)}</select>
            <input type="number" placeholder="الممشي (كم)" value={mileage} onChange={(e) => setMileage(e.target.value)} style={sty} />
            <input type="text" placeholder="اللون" value={color} onChange={(e) => setColor(e.target.value)} style={sty} />
            <div style={{ border: "2px dashed #ccc", padding: "12px", borderRadius: "8px", marginBottom: "12px", textAlign: "center", backgroundColor: "#f8fafc" }}><input type="file" multiple accept="image/*" onChange={handleFile} style={{ display: "none" }} id="f" /><label htmlFor="f" style={{ cursor: "pointer", fontWeight: "bold", color: "#334155", display: "block" }}>{imgSt}</label></div>
            <textarea placeholder="مواصفات إضافية..." rows={2} value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} style={sty}></textarea>
            <button onClick={handlePublish} style={{ width: "100%", padding: "12px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>نشر الإعلان فعلياً</button>
          </div>
        )}

        {tab === "list" && (
          <div>
            {adsList.length === 0 ? <p>لا توجد إعلانات.</p> : adsList.map((ad: any, i: number) => (
              <div key={i} style={{ padding: "10px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "8px" }}>
                <b>{ad.title || ad.name}</b> - <span style={{ color: "#2563eb" }}>${ad.price}</span>
                <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
                  {ad.status !== "active" && <button onClick={() => handleApprove(ad.id)} style={{ flex: 1, backgroundColor: "#059669", color: "#fff", border: "none", padding: "5px", borderRadius: "4px", cursor: "pointer" }}>✓ موافقة ونشر</button>}
                  <button onClick={() => handleDelete(ad.id)} style={{ backgroundColor: "#ef4444", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "pay" && (
          <div>
            <input placeholder="PayPal" value={paypal} onChange={(e) => setPaypal(e.target.value)} style={sty} />
            <input placeholder="اسم مستلم Western Union" value={wName} onChange={(e) => setWName(e.target.value)} style={sty} />
            <input placeholder="الدولة والمدينة" value={wCountry} onChange={(e) => setWCountry(e.target.value)} style={sty} />
            <input placeholder="رقم الهاتف" value={wPhone} onChange={(e) => setWPhone(e.target.value)} style={sty} />
            <button onClick={handleSave} style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>حفظ الإعدادات بالكامل</button>
          </div>
        )}
      </div>
    </div>
  );
}
