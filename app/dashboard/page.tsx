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
  
  // حالة حفظ كود الصورة المشفر
  const [encodedImage, setEncodedImage] = useState("");
  const [imgStatus, setImgStatus] = useState("اضغط هنا لاختيار صورة السيارة");

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

  // دالة ذكية لتحويل الصورة المرفوعة من هاتف المستخدم إلى كود نصي مشفر
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImgStatus("جاري تحضير الصورة...");
    const reader = new FileReader();
    reader.onloadend = () => {
      setEncodedImage(reader.result as string);
      setImgStatus("📷 تم تجهيز الصورة بنجاح!");
    };
    reader.readAsDataURL(file);
  };

  async function handlePublish() {
    if (!brand || !model || !price || !year) return alert("امْلأ الماركة والموديل والسعر والسنة");
    
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
      image_url: encodedImage // إرسال نص الصورة المشفر ليتم حفظه في قاعدة البيانات مباشرة
    };

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      
      if (resData.success) { 
        alert("🎉 تم نشر الإعلان وحفظ الصورة بنجاح! تفضل بتفعيله من القائمة."); 
        setBrand(""); setModel(""); setPrice(""); setYear(""); setMileage(""); setColor(""); setExtraInfo(""); setEncodedImage(""); setImgStatus("اضغط هنا لاختيار صورة السيارة");
        loadData(); 
      } else {
        alert("فشل نشر الإعلان: " + (resData.error || "خطأ من السيرفر"));
      }
    } catch(err) { alert("خطأ في اتصال الإنترنت"); }
  }

  async function handleApprove(id: number) {
    try {
      const res = await fetch("/api/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "active" })
      });
      if (res.ok) { alert("✓ تم تفعيل الإعلان بنجاح ويظهر للزوار الآن بالصور!"); loadData(); }
    } catch (e) { alert("فشل التفعيل"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`/api/ads?id=${id}`, { method: "DELETE" });
      if (res.ok) { alert("🗑️ تم حذف الإعلان!"); loadData(); }
    } catch (e) { alert("فشل الحذف"); }
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
          <button onClick={() => setTab("ads")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "ads" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>🚗 إنشاء إعلان</button>
          <button onClick={() => setTab("list")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "list" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>📋 الإعلانات ({adsList.length})</button>
          <button onClick={() => setTab("pay")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "pay" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>⚙️ الدفع</button>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #eee" }}>
        {tab === "ads" && (
          <div>
            <h3>إضافة إعلان جديد</h3>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} style={styIn}><option value="">اختر الماركة</option>{Object.keys(data).map(b => <option key={b} value={b}>{b}</option>)}</select>
            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} style={styIn}><option value="">اختر الموديل</option>{brand && data[brand].map(m => <option key={m} value={m}>{m}</option>)}</select>
            <input type="number" placeholder="السعر ($) - يدوي" value={price} onChange={(e) => setPrice(e.target.value)} style={styIn} />
            <select value={year} onChange={(e) => setYear(e.target.value)} style={styIn}><option value="">اختر السنة</option>{Array.from({ length: 27 }, (_, i) => String(2026 - i)).map(y => <option key={y} value={y}>{y}</option>)}</select>
            <input type="number" placeholder="المسافة المقطوعة (بالكيلومترات)" value={mileage} onChange={(e) => setMileage(e.target.value)} style={styIn} />
            <select value={color} onChange={(e) => setColor(e.target.value)} style={styIn}><option value="">اختر اللون</option><option value="أبيض">أبيض</option><option value="أسود">أسود</option><option value="فضي">فضي</option><option value="رمادي">رمادي</option></select>
            
            {/* واجهة اختيار الملف الفورية */}
            <div style={{ border: "2px dashed #ccc", padding: "12px", borderRadius: "8px", marginBottom: "12px", backgroundColor: "#f8fafc" }}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id="files" />
              <label htmlFor="files" style={{ display: "block", textAlign: "center", cursor: "pointer", fontWeight: "bold", color: "#334155" }}>
                {imgStatus}
              </label>
            </div>

            <textarea placeholder="معلومات إضافية..." rows={3} value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} style={styIn}></textarea>
            <button onClick={handlePublish} style={{ width: "100%", padding: "12px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>نشر الإعلان</button>
          </div>
        )}

        {tab === "list" && (
          <div>
            <h3>الإعلانات بموقعك</h3>
            {adsList.length === 0 ? <p>لا توجد إعلانات.</p> : adsList.map((ad: any, i: number) => (
              <div key={i} style={{ padding: "12px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "10px" }}>
                <b>{ad.title || `${ad.brand} ${ad.model}`}</b> - <span style={{ color: "#2563eb", fontWeight: "bold" }}>${ad.price}</span>
                <div style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>السنة: {ad.year || "غير محدد"} | اللون: {ad.color || "غير محدد"}</div>
                
                <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
                  {ad.status !== "active" && (
                    <button onClick={() => handleApprove(ad.id)} style={{ flex: 1, padding: "6px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>✓ موافقة ونشر</button>
                  )}
                  {ad.status === "active" && (
                    <span style={{ flex: 1, color: "#059669", fontSize: "12px", fontWeight: "bold", alignSelf: "center" }}>✓ الإعلان نشط بالواجهة</span>
                  )}
                  <button onClick={() => handleDelete(ad.id)} style={{ padding: "6px 12px", backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>🗑️ حذف</button>
                </div>
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
