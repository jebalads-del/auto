"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("ads");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [color, setColor] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  
  const [paypalEmail, setPaypalEmail] = useState("");
  const [westernName, setWesternName] = useState("");
  const [westernCountry, setWesternCountry] = useState("");
  const [westernPhone, setWesternPhone] = useState("");

  // مصفوفة موسعة للماركات والموديلات المشهورة
  const brands = ["تويوتا", "مرسيدس", "بي إم دبليو", "نيسان", "هيونداي", "كيا", "فورد", "شيفروليه", "هوندا", "لكزس"];
  const models: { [key: string]: string[] } = {
    "تويوتا": ["كامري", "كورولا", "لاندكروزر", "هيلوكس", "يارس", "راف فور"],
    "مرسيدس": ["C-Class", "E-Class", "S-Class", "GLE", "GLC", "A-Class"],
    "بي إم دبليو": ["الفئة الثالثة", "الفئة الخامسة", "الفئة السابعة", "X5", "X6", "X3"],
    "نيسان": ["صني", "ألتيما", "باترول", "باثفايندر", "نافارا", "اكس تريل"],
    "هيونداي": ["إلنترا", "سوناتا", "أكسنت", "توسان", "سانتا في", "كريتا"],
    "كيا": ["سيراتو", "أوبتيما", "سبورتج", "سورينتو", "ريو", "بيغاس"],
    "فورد": ["موستانج", "تيريتوري", "إكسبلورر", "F-150", "فوكس", "إيدج"],
    "شيفروليه": ["تاهو", "ماليبو", "كابتيفا", "سلفرادو", "كامارو", "ترافرس"],
    "هوندا": ["أكورد", "سيفيك", "CR-V", "سيتي", "بايلوت"],
    "لكزس": ["LX", "RX", "ES", "IS", "GX", "LS"]
  };

  // توليد السنوات من 2026 نزولاً إلى 2000
  const years = Array.from({ length: 27 }, (_, i) => String(2026 - i));
  
  // قوائم منسدلة للكيلومترات واللوان
  const kmOptions = ["0 (وكالة)", "1 - 10,000", "10,000 - 30,000", "30,000 - 60,000", "60,000 - 100,000", "100,000 - 150,000", "150,000 - 200,000", "+200,000"];
  const colors = ["أبيض", "أسود", "فضي", "رمادي", "أزرق", "أحمر", "كحلي", "ذهبي", "بني", "لؤلؤي"];

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data) {
          setPaypalEmail(data.paypal_email || "");
          setWesternName(data.western_name || "");
          setWesternCountry(data.western_country || "");
          setWesternPhone(data.western_phone || "");
        }
      } catch (err) { console.error(err); }
    }
    fetchSettings();
  }, []);

  async function handleSaveSettings() {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypal_email: paypalEmail, western_name: westernName, western_country: westernCountry, western_phone: westernPhone })
      });
      if (res.ok) alert("🎉 تم حفظ الإعدادات!");
    } catch (err) { alert("خطأ في الاتصال"); }
  }

  async function handlePublishAd() {
    if (!brand || !model || !price) { alert("الرجاء ملء الحقول الأساسية"); return; }
    try {
      // هنا سيتم رفع الصور والبيانات لاحقاً إلى الـ API
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, model, year, kilometers, color, details, price: parseFloat(price)||0, name: brand + " " + model })
      });
      if (res.ok) { 
        alert("🚗 تم نشر الإعلان بنجاح مع القوائم المحدثة!"); 
        setBrand(""); setModel(""); setYear(""); setKilometers(""); setColor(""); setDetails(""); setPrice(""); setImages(null);
      }
    } catch (err) { alert("خطأ في النشر"); }
  }

  const styles = {
    container: { direction: "rtl" as const, textAlign: "right" as const, padding: "15px", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" },
    header: { backgroundColor: "#0f172a", color: "#ffffff", padding: "20px", borderRadius: "12px", marginBottom: "20px", textAlign: "center" as const },
    btnContainer: { display: "flex", flexWrap: "wrap" as const, gap: "8px", marginTop: "15px", justifyContent: "center" },
    btn: (active: boolean) => ({ flex: 1, minWidth: "90px", padding: "10px", borderRadius: "8px", border: "none", fontSize: "14px", fontWeight: "bold", cursor: "pointer", backgroundColor: active ? "#2563eb" : "#1e293b", color: active ? "#ffffff" : "#cbd5e1" }),
    card: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" },
    formGroup: { marginBottom: "15px" },
    label: { display: "block", fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "5px" },
    input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" as const, fontSize: "15px", backgroundColor: "#f8fafc" },
    fileInputContainer: { border: "2px dashed #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" as const, backgroundColor: "#f8fafc", cursor: "pointer" },
    submitBtn: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#059669", color: "#ffffff", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontSize: "22px", margin: 0 }}>🛠️ لوحة التحكم</h1>
        <div style={styles.btnContainer}>
          <button onClick={() => setActiveTab("ads")} style={styles.btn(activeTab === "ads")}>🚗 الإعلانات</button>
          <button onClick={() => setActiveTab("users")} style={styles.btn(activeTab === "users")}>👥 المستخدمين</button>
          <button onClick={() => setActiveTab("settings")} style={styles.btn(activeTab === "settings")}>⚙️ الدفع</button>
        </div>
      </div>

      <div style={styles.card}>
        {activeTab === "ads" && (
          <div>
            <h2 style={{ fontSize: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "15px" }}>إضافة إعلان جديد</h2>
            
            <div style={styles.formGroup}><label style={styles.label}>الماركة</label>
              <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} style={styles.input}>
                <option value="">اختر الماركة</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}><label style={styles.label}>الموديل</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} style={styles.input}>
                <option value="">اختر الموديل</option>
                {brand && models[brand]?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}><label style={styles.label}>السعر ($) - يدوي</label>
              <input type="number" placeholder="أدخل السعر بالدولار" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formGroup}><label style={styles.label}>السنة</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} style={styles.input}>
                <option value="">اختر السنة</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}><label style={styles.label}>المسافة المقطوعة (كيلومترات)</label>
              <select value={kilometers} onChange={(e) => setKilometers(e.target.value)} style={styles.input}>
                <option value="">اختر المسافة المقطوعة</option>
                {kmOptions.map(km => <option key={km} value={km}>{km}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}><label style={styles.label}>اللون</label>
              <select value={color} onChange={(e) => setColor(e.target.value)} style={styles.input}>
                <option value="">اختر اللون</option>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* حقل رفع صور السيارة الجديد */}
            <div style={styles.formGroup}>
              <label style={styles.label}>صور السيارة</label>
              <div style={styles.fileInputContainer}>
                <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} style={{ display: "none" }} id="car-images" />
                <label htmlFor="car-images" style={{ cursor: "pointer", display: "block", color: "#475569", fontSize: "14px" }}>
                  📷 {images && images.length > 0 ? `تم اختيار ${images.length} صور` : "اضغط هنا لاختيار صور السيارة من جهازك"}
                </label>
              </div>
            </div>

            <div style={styles.formGroup}><label style={styles.label}>تفاصيل إضافية</label>
              <textarea placeholder="اكتب أي معلومات إضافية هنا..." rows={3} value={details} onChange={(e) => setDetails(e.target.value)} style={styles.input}></textarea>
            </div>
            
            <button onClick={handlePublishAd} style={styles.submitBtn}>نشر الإعلان</button>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 style={{ fontSize: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>إدارة المستخدمين</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <div><b>أحمد محمد</b><br/><span style={{ fontSize: "12px", color: "#64748b" }}>ahmed@example.com</span></div>
