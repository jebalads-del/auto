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
  const [imgCount, setImgCount] = useState(0);
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

  function loadData() {
    fetch("/api/ads").then(r => r.json()).then(d => setAdsList(Array.isArray(d) ? d : [])).catch(e => console.log(e));
    fetch("/api/settings").then(r => r.json()).then(d => {
      if(d) { setPaypal(d.paypal_email||""); setWName(d.western_name||""); setWCountry(d.western_country||""); setWPhone(d.western_phone||""); }
    }).catch(e => console.log(e));
  }

  useEffect(() => { loadData(); }, []);

  async function handlePublish() {
    if (!brand || !model || !price || !year) return alert("الرجاء تحديد الماركة والموديل والسعر والسنة");
    
    // تطابق كامل مع الحقول المطلوبة في ملف الـ API الخلفي لموقعك
    const payload = {
      title: `${brand} ${model} ${year}`,
      price: parseFloat(price),
      description: extraInfo || `${brand} ${model} موديل ${year}`,
      brand: brand,
      model: model,
      year: parseInt(year),
      color: color || "غير محدد",
      mileage: parseInt(mileage) || 0,
      extra_info: extraInfo,
      image_url: "" // سيتم إرسال رابط الصورة الفعلي هنا بعد تفعيل خادم الصور لاحقاً
    };

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      
      if (resData.success) { 
        alert("🎉 تم نشر الإعلان بنجاح في قاعدة البيانات وبانتظار الموافقة!"); 
        setBrand(""); setModel(""); setPrice(""); setYear(""); setMileage(""); setColor(""); setExtraInfo(""); setImgCount(0);
        loadData(); 
      } else {
        alert("فشل نشر الإعلان: " + (resData.error || "خطأ غير معروف"));
      }
    } catch(err) {
      alert("فشل الإرسال، تحقق من اتصال الإنترنت");
    }
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
          <button onClick={() => setTab("ads")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "ads" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>🚗 إنشاء إعلان</button>
          <button onClick={() => setTab("list")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "list" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>📋 الإعلانات ({adsList.length})</button>
          <button onClick={() => setTab("pay")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "pay" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>⚙️ الدفع</button>
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
            <input type="number" placeholder="المسافة المقطوعة (بالكيلومترات عدداً)" value={mileage} onChange={(e) => setMileage(e.target.value)} style={styIn} />
            <select value={color} onChange={(e) => setColor(e.target.value)} style={styIn}>
              <option value="">اختر اللون</option>
              <option value="أبيض">أبيض</option>
              <option value="أسود">أسود</option>
              <option value="فضي">فضي</option>
              <option value="رمادي">رمادي</option>
            </select>
            
            {/* إستعادة زر اختيار الصور للهاتف مع عداد ذكي */}
            <div style={{ border: "2px dashed #ccc", padding: "12px", borderRadius: "8px", marginBottom: "12px", cursor: "pointer" }}>
              <input type="file" multiple accept="image/*" onChange={(e) => setImgCount(e.target.files?.length || 0)} style={{ display: "none" }} id="files" />
              <label htmlFor="files" style={{ display: "block", textAlign: "center", cursor: "pointer", color: "#334155" }}>
                📷 {imgCount > 0 ? `تم اختيار ${imgCount} صور للسيارة` : "اضغط هنا لاختيار صور السيارة من جهازك"}
              </label>
            </div>

            <textarea placeholder="معلومات إضافية ومواصفات..." rows={3} value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} style={styIn}></textarea>
            <button onClick={handlePublish} style={{ width: "100%", padding: "12px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>نشر الإعلان فعلياً</button>
          </div>
        )}

        {tab === "list" && (
          <div>
            <h3>الإعلانات بموقعك</h3>
            {adsList.length === 0 ? <p>لا توجد إعلانات حالياً.</p> : adsList.map((ad: any, i: number) => (
              <div key={i} style={{ padding: "10px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "8px" }}>
                <b>{ad.title || ad.name || `${ad.brand} ${ad.model}`}</b> - <span style={{ color: "#2563eb" }}>${ad.price}</span>
                <div style={{ fontSize: "12px", color: "#666" }}>السنة: {ad.year || "غير محدد"} | اللون: {ad.color || "غير محدد"} | العداد: {ad.mileage || 0} كم</div>
                <div style={{ fontSize: "11px", color: ad.status === "active" ? "#059669" : "#d97706", marginTop: "4px" }}>حالة الإعلان: {ad.status === "active" ? "✓ نشط ومقبول" : "⏰ في انتظار المراجعة"}</div>
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
            <button onClick={handleSave} style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>حفظ الإعدادات كاملة</button>
          </div>
        )}
      </div>
    </div>
  );
}
