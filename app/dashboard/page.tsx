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
  const [paypalEmail, setPaypalEmail] = useState("");
  const [westernName, setWesternName] = useState("");
  const [westernCountry, setWesternCountry] = useState("");
  const [westernPhone, setWesternPhone] = useState("");

  const brands = ["مرسيدس", "نيسان", "فورد", "تويوتا"];
  const models: { [key: string]: string[] } = {
    "مرسيدس": ["C200", "E200", "S500"],
    "نيسان": ["صني", "ألتيما", "باترول"],
    "فورد": ["موستانج", "فوكس"],
    "تويوتا": ["كورولا", "كامري"]
  };

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
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, model, year: parseInt(year)||0, kilometers: parseInt(kilometers)||0, color, details, price: parseFloat(price)||0, name: brand + " " + model })
      });
      if (res.ok) { alert("🚗 تم النشر!"); setBrand(""); setModel(""); setYear(""); setKilometers(""); setColor(""); setDetails(""); setPrice(""); }
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
    input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" as const, fontSize: "15px" },
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
            <h2 style={{ fontSize: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>إضافة إعلان جديد</h2>
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
            <div style={styles.formGroup}><label style={styles.label}>السعر ($)</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>السنة</label><input type="number" value={year} onChange={(e) => setYear(e.target.value)} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>الكيلومترات</label><input type="number" value={kilometers} onChange={(e) => setKilometers(e.target.value)} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>اللون</label><input type="text" value={color} onChange={(e) => setColor(e.target.value)} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>تفاصيل إضافية</label><textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} style={styles.input}></textarea></div>
            <button onClick={handlePublishAd} style={styles.submitBtn}>نشر الإعلان</button>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 style={{ fontSize: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>إدارة المستخدمين</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <div><b>أحمد محمد</b><br/><span style={{ fontSize: "12px", color: "#64748b" }}>ahmed@example.com</span></div>
              <button style={{ backgroundColor: "#ef4444", color: "#white", border: "none", padding: "6px 12px", borderRadius: "6px" }}>حظر</button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 style={{ fontSize: "18px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>إعدادات الدفع</h2>
            <div style={styles.formGroup}><label style={styles.label}>PayPal</label><input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={styles.input} /></div>
            <h3 style={{ fontSize: "16px", marginTop: "20px" }}>Western Union</h3>
            <div style={styles.formGroup}><label style={styles.label}>اسم المستلم</label><input type="text" value={westernName} onChange={(e) => setWesternName(e.target.value)} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>الدولة</label><input type="text" value={westernCountry} onChange={(e) => setWesternCountry(e.target.value)} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>رقم الهاتف</label><input type="text" value={westernPhone} onChange={(e) => setWesternPhone(e.target.value)} style={styles.input} /></div>
            <button onClick={handleSaveSettings} style={{ ...styles.submitBtn, backgroundColor: "#2563eb" }}>حفظ الإعدادات</button>
          </div>
        )}
      </div>
    </div>
  );
}
