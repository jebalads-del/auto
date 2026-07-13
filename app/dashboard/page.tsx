"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("ads");
  
  // حالات الإعلانات
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [color, setColor] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");

  // حالات إعدادات الدفع والموقع
  const [paypalEmail, setPaypalEmail] = useState("");
  const [westernName, setWesternName] = useState("");
  const [westernCountry, setWesternCountry] = useState("");
  const [westernPhone, setWesternPhone] = useState("");

  // قوائم منسدلة ديناميكية
  const brands = ["مرسيدس", "نيسان", "فورد", "تويوتا"];
  const models: { [key: string]: string[] } = {
    "مرسيدس": ["C200", "E200", "S500"],
    "نيسان": ["صني", "ألتيما", "باترول"],
    "فورد": ["موستانج", "فوكس"],
    "تويوتا": ["كورولا", "كامري"]
  };

  // جلب إعدادات الدفع الحالية تلقائياً عند فتح الصفحة
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data && data[0]) {
          setPaypalEmail(data[0].paypal_email || "");
          setWesternName(data[0].western_name || "");
          setWesternCountry(data[0].western_country || "");
          setWesternPhone(data[0].western_phone || "");
        }
      } catch (err) {
        console.error("خطأ في جلب الإعدادات:", err);
      }
    }
    fetchSettings();
  }, []);

  // دالة حفظ إعدادات الدفع
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
      const data = await res.json();
      if (data.success) {
        alert("🎉 تم حفظ إعدادات بوابات الدفع بنجاح في قاعدة البيانات!");
      } else {
        alert("فشل الحفظ: " + data.error);
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بالخادم");
    }
  }

  // دالة نشر الإعلان الجديد
  async function handlePublishAd() {
    if (!brand || !model || !price) {
      alert("الرجاء تحديد الماركة والموديل والسعر على الأقل!");
      return;
    }
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          model,
          year: parseInt(year) || 0,
          kilometers: parseInt(kilometers) || 0,
          color,
          details,
          price: parseFloat(price) || 0,
          name: `${brand} ${model}` // الاسم المدمج المتوافق مع الكود القديم لموقعك
        })
      });
      if (res.ok) {
        alert("🚗 تم نشر إعلان السيارة بنجاح وحفظه بالقوائم المنسدلة!");
        // تصفير الحقول بعد النشر
        setBrand(""); setModel(""); setYear(""); setKilometers(""); setColor(""); setDetails(""); setPrice("");
      } else {
        alert("فشل في نشر الإعلان");
      }
    } catch (err) {
      alert("حدث خطأ أثناء نشر الإعلان");
    }
  }

  const styles = {
    container: { direction: "rtl" as const, textAlign: "right" as const, padding: "15px", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" },
    header: { backgroundColor: "#0f172a", color: "#ffffff", padding: "20px", borderRadius: "12px", marginBottom: "20px", textAlign: "center" as const },
    btnContainer: { display: "flex", flexWrap: "wrap" as const, gap: "8px", marginTop: "15px", justifyContent: "center" },
    btn: (active: boolean) => ({ flex: 1, minWidth: "90px", padding: "10px", borderRadius: "8px", border: "none", fontSize: "14px", fontWeight: "bold", cursor: "pointer", backgroundColor: active ? "#2563eb" : "#1e293b", color: active ? "#ffffff" : "#cbd5e1" }),
    card: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
    formGroup: { marginBottom: "15px" },
    label: { display: "block", fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "5px" },
    input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", boxSizing: "border-box" as const, fontSize: "15px", color: "#334155" },
    submitBtn: { width: "100%", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#059669", color: "#ffffff", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }
  };

  return (
    <div style={styles.container}>
      {/* الهيدر */}
      <div style={styles.header}>
        <h1 style={{ fontSize: "22px", margin: 0 }}>🛠️ لوحة تحكم الإدارة المربوطة</h1>
        <div style={styles.btnContainer}>
          <button onClick={() => setActiveTab("ads")} style={styles.btn(activeTab === "ads")}>🚗 إنشاء إعلان</button>
          <button onClick={() => setActiveTab("users")} style={styles.btn(activeTab === "users")}>👥 المستخدمين</button>
          <button onClick={() => setActiveTab("settings")} style={styles.btn(activeTab === "settings")}>⚙️ إعدادات الدفع</button>
        </div>
      </div>

      {/* صندوق المحتوى */}
      <div style={styles.card}>
        
        {/* قسم إنشاء إعلان */}
        {activeTab === "ads" && (
          <div>
            <h2 style={{ fontSize: "18px", color: "#1e293b", margin: "0 0 15px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>إضافة إعلان جديد</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>ماركة السيارة</label>
              <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} style={styles.input}>
                <option value="">اختر ماركة السيارة</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>الموديل</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} style={{ ...styles.input, opacity: brand ? 1 : 0.5 }}>
                <option value="">اختر الموديل</option>
                {brand && models[brand]?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>السعر ($)</label>
              <input type="number" placeholder="أدخل السعر بالدولار" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>السنة</label>
              <input type="number" placeholder="مثال: 2024" value={year} onChange={(e) => setYear(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>الكيلومترات</label>
              <input type="number" placeholder="أدخل المسافة المقطوعة" value={kilometers} onChange={(e) => setKilometers(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>اللون</label>
              <input type="text" placeholder="لون السيارة" value={color} onChange={(e) => setColor(e.target.value)} style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>معلومات إضافية</label>
              <textarea placeholder="اكتب تفاصيل إضافية عن السيارة..." rows={3} value={details} onChange={(e) => setDetails(e.target.value)} style={{ ...styles.input, resize: "vertical" }}></textarea>
            </div>

            <button onClick={handlePublishAd} style={styles.submitBtn}>نشر الإعلان</button>
          </div>
        )}

        {/* قسم المستخدمين */}
        {activeTab === "users" && (
          <div>
            <h2 style={{ fontSize: "18px", color: "#1e293b", margin: "0 0 15px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>إدارة مستخدمين الموقع</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
              <div>
                <div style={{ fontWeight: "bold", color: "#1e293b" }}>أحمد محمد</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>ahmed@example.com</div>
              </div>
              <button style={{ backgroundColor: "#ef4444", color: "#ffffff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>حظر</button>
            </div>
          </div>
        )}

        {/* قسم إعدادات الدفع */}
        {activeTab === "settings" && (
          <div>
            <h2 style={{ fontSize: "18px", color: "#1e293b", margin: "0 0 15px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>بوابة PayPal</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>حساب PayPal المستلم</label>
              <input type="email" placeholder="example@paypal.com" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={{ ...styles.input, textAlign: "left", direction: "ltr" }} />
            </div>
            
            <h2 style={{ fontSize: "18px", color: "#1e293b", margin: "20px 0 15px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>بوابة Western Union</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>اسم المستلم الكامل (باللغة الإنجليزية)</label>
