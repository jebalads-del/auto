"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("ads");
  
  // حالات حقول الإدخال
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [color, setColor] = useState("");
  const [details, setDetails] = useState("");
  const [imgCount, setImgCount] = useState(0);

  // حالة جلب قائمة الإعلانات الحالية من قاعدة البيانات
  const [adsList, setAdsList] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);

  // حالات إعدادات الدفع
  const [paypalEmail, setPaypalEmail] = useState("");
  const [westernName, setWesternName] = useState("");
  const [westernCountry, setWesternCountry] = useState("");
  const [westernPhone, setWesternPhone] = useState("");

  const data: { [key: string]: string[] } = {
    "تويوتا": ["كامري", "كورولا", "لاندكروزر", "يارس"],
    "مرسيدس": ["C-Class", "E-Class", "S-Class", "GLC"],
    "بي إم دبليو": ["الفئة 3", "الفئة 5", "X5", "X6"],
    "نيسان": ["صني", "ألتيما", "باترول", "اكس تريل"],
    "هيونداي": ["إلنترا", "سوناتا", "توسان", "أكسنت"],
    "كيا": ["سيراتو", "سبورتج", "سورينتو", "ريو"]
  };

  // 1. جلب الإعلانات الحالية وإعدادات الدفع عند فتح الصفحة
  useEffect(() => {
    async function loadDashboardData() {
      try {
        // جلب الإعلانات
        const adsRes = await fetch("/api/ads");
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setAdsList(Array.isArray(adsData) ? adsData : []);
        }
      } catch (err) {
        console.error("خطأ في جلب الإعلانات:", err);
      } finally {
        setLoadingAds(false);
      }

      try {
        // جلب إعدادات الدفع
        const setRes = await fetch("/api/settings");
        if (setRes.ok) {
          const setData = await setRes.json();
          if (setData) {
            setPaypalEmail(setData.paypal_email || "");
            setWesternName(setData.western_name || "");
            setWesternCountry(setData.western_country || "");
            setWesternPhone(setData.western_phone || "");
          }
        }
      } catch (err) {
        console.error("خطأ في جلب الإعدادات:", err);
      }
    }
    loadDashboardData();
  }, []);

  // 2. دالة إرسال ونشر الإعلان الجديد لقاعدة البيانات
  async function handlePublishAd() {
    if (!brand || !model || !price || !year) {
      alert("الرجاء تحديد الماركة والموديل والسعر والسنة على الأقل!");
      return;
    }

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          model,
          price: parseFloat(price) || 0,
          year: parseInt(year) || 0,
          kilometers,
          color,
          details,
          name: `${brand} ${model}` // الاسم المدمج لعرضه في واجهة موقعك الأساسية
        })
      });

      if (res.ok) {
        alert("🎉 تم نشر الإعلان وحفظه بنجاح في قاعدة البيانات!");
        
        // تحديث قائمة الإعلانات المعروضة فوراً بدون إنعاش الصفحة
        const updatedAds = await fetch("/api/ads").then(r => r.json());
        setAdsList(Array.isArray(updatedAds) ? updatedAds : []);

        // تصفير الحقول للإدخال الجديد
        setBrand(""); setModel(""); setPrice(""); setYear(""); setKilometers(""); setColor(""); setDetails(""); setImgCount(0);
      } else {
        alert("حدث خطأ من الخادم أثناء محاولة نشر الإعلان.");
      }
    } catch (err) {
      alert("فشل الاتصال بالخادم، تحقق من جودة الإنترنت.");
    }
  }

  // 3. دالة حفظ وتحديث إعدادات الدفع
  async function handleSaveSettings() {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypal_email: paypalEmail,
          western_name: westernName,
          western_country: westernCountry,
          western_phone: westernPhone
        })
      });
      if (res.ok) {
        alert("⚙️ تم تحديث بيانات بوابات الدفع في قاعدة البيانات بنجاح!");
      } else {
        alert("فشل في حفظ التعديلات.");
      }
    } catch (err) {
      alert("خطأ في الاتصال بالخادم.");
    }
  }

  const sty = {
    in: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px", boxSizing: "border-box" as const }
  };

  return (
    <div style={{ direction: "rtl", textAlign: "right", padding: "15px", fontFamily: "sans-serif" }}>
      {/* لوحة الاختيارات العلوية */}
      <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px" }}>
        <h2 style={{ textAlign: "center", margin: "0 0 10px 0" }}>🛠️ لوحة التحكم</h2>
        <div style={{ display: "flex", gap: "5px" }}>
          <button onClick={() => setTab("ads")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "ads" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>🚗 إنشاء إعلان</button>
          <button onClick={() => setTab("list")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "list" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>📋 الإعلانات ({adsList.length})</button>
          <button onClick={() => setTab("pay")} style={{ flex: 1, padding: "8px", backgroundColor: tab === "pay" ? "#2563eb" : "#1e293b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>⚙️ الدفع</button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #eee" }}>
        
        {/* أ: قسم إضافة إعلان جديد */}
        {tab === "ads" && (
          <div>
            <h3 style={{ margin: "0 0 12px 0", color: "#1e293b" }}>إضافة إعلان جديد</h3>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} style={sty.in}>
              <option value="">اختر الماركة</option>
              {Object.keys(data).map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} style={sty.in}>
              <option value="">اختر الموديل</option>
              {brand && data[brand].map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <input type="number" placeholder="السعر ($) - يدوي" value={price} onChange={(e) => setPrice(e.target.value)} style={sty.in} />
            
            <select value={year} onChange={(e) => setYear(e.target.value)} style={sty.in}>
              <option value="">اختر السنة</option>
              {Array.from({ length: 27 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <select value={kilometers} onChange={(e) => setKilometers(e.target.value)} style={sty.in}>
              <option value="">المسافة (كم)</option>
              <option value="0 (وكالة)">0 (وكالة)</option>
              <option value="1-50 ألف">1-50 ألف</option>
              <option value="50-100 ألف">50-100 ألف</option>
              <option value="+100 ألف">+100 ألف</option>
            </select>

            <select value={color} onChange={(e) => setColor(e.target.value)} style={sty.in}>
              <option value="">اختر اللون</option>
              <option value="أبيض">أبيض</option>
              <option value="أسود">أسود</option>
              <option value="فضي">فضي</option>
              <option value="رمادي">رمادي</option>
              <option value="أزرق">أزرق</option>
            </select>
            
            <div style={{ border: "2px dashed #ccc", padding: "10px", borderRadius: "8px", marginBottom: "12px", cursor: "pointer" }}>
              <input type="file" multiple accept="image/*" onChange={(e) => setImgCount(e.target.files?.length || 0)} style={{ display: "none" }} id="files" />
              <label htmlFor="files" style={{ display: "block", textAlign: "center", cursor: "pointer" }}>
                📷 {imgCount > 0 ? `تم اختيار ${imgCount} صور` : "اضغط هنا لاختيار صور السيارة"}
              </label>
            </div>

            <textarea placeholder="معلومات إضافية..." rows={3} value={details} onChange={(e) => setDetails(e.target.value)} style={sty.in}></textarea>
            
            <button onClick={handlePublishAd} style={{ width: "100%", padding: "12px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
              نشر الإعلان فعلياً
            </button>
          </div>
        )}

        {/* ب: قسم عرض وإدارة الإعلانات الحالية من قاعدة البيانات */}
        {tab === "list" && (
          <div>
            <h3 style={{ margin: "0 0 12px 0", color: "#1e293b" }}>الإعلانات الحالية بموقعك</h3>
            {loadingAds ? (
              <p style={{ textAlign: "center", color: "#666" }}>جاري تحميل السيارات من قاعدة البيانات...</p>
            ) : adsList.length === 0 ? (
              <p style={{ textAlign: "center", color: "#999" }}>لا توجد إعلانات منشورة حالياً.</p>
            ) : (
              adsList.map((ad: any, index: number) => (
                <div key={ad.id || index} style={{ padding: "12px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: "bold", block: "inline" }}>{ad.name || `${ad.brand} ${ad.model}`}</span>
                    <span style={{ color: "#2563eb", marginRight: "10px", fontWeight: "bold" }}>${ad.price}</span>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>السنة: {ad.year} | اللون: {ad.color || "غير محدد"}</div>
