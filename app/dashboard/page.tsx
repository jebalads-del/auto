"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("ads");
  const [brand, setBrand] = useState("");

  const brands = ["مرسيدس", "نيسان", "فورد", "تويوتا"];
  const models: { [key: string]: string[] } = {
    "مرسيدس": ["C200", "E200", "S500"],
    "نيسان": ["صني", "ألتيما", "باترول"],
    "فورد": ["موستانج", "فوكس"],
    "تويوتا": ["كورولا", "كامري"]
  };

  // تصميم مدمج لضمان الألوان والمحاذاة بدون تيلويند
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
      {/* الهيدر العلوي */}
      <div style={styles.header}>
        <h1 style={{ fontSize: "22px", margin: 0 }}>🛠️ لوحة تحكم الإدارة</h1>
        <div style={styles.btnContainer}>
          <button onClick={() => setActiveTab("ads")} style={styles.btn(activeTab === "ads")}>🚗 الإعلانات</button>
          <button onClick={() => setActiveTab("users")} style={styles.btn(activeTab === "users")}>👥 المستخدمين</button>
          <button onClick={() => setActiveTab("settings")} style={styles.btn(activeTab === "settings")}>⚙️ إعدادات الدفع</button>
        </div>
      </div>

      {/* صندوق المحتوى الرئيسي */}
      <div style={styles.card}>
        
        {/* قسم الإعلانات */}
        {activeTab === "ads" && (
          <div>
            <h2 style={{ fontSize: "18px", color: "#1e293b", margin: "0 0 15px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>إضافة إعلان جديد</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>ماركة السيارة</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} style={styles.input}>
                <option value="">اختر ماركة السيارة</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>الموديل</label>
              <select disabled={!brand} style={{ ...styles.input, opacity: brand ? 1 : 0.5 }}>
                <option value="">اختر الموديل</option>
                {brand && models[brand]?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>السنة</label>
              <input type="number" placeholder="مثال: 2024" style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>الكيلومترات</label>
              <input type="number" placeholder="أدخل المسافة المقطوعة" style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>اللون</label>
              <input type="text" placeholder="لون السيارة" style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>معلومات إضافية</label>
              <textarea placeholder="اكتب تفاصيل إضافية هنا..." rows={3} style={{ ...styles.input, resize: "vertical" }}></textarea>
            </div>

            <button style={styles.submitBtn}>نشر الإعلان</button>
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

        {/* قسم الإعدادات */}
        {activeTab === "settings" && (
          <div>
            <h2 style={{ fontSize: "18px", color: "#1e293b", margin: "0 0 15px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>بوابة PayPal</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>حساب PayPal المستلم</label>
              <input type="email" placeholder="example@paypal.com" style={{ ...styles.input, textAlign: "left", direction: "ltr" }} />
            </div>
            
            <h2 style={{ fontSize: "18px", color: "#1e293b", margin: "20px 0 15px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>بوابة Western Union</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>اسم المستلم الكامل (باللغة الإنجليزية)</label>
              <input type="text" placeholder="أدخل الاسم الكامل" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>الدولة والمدينة</label>
              <input type="text" placeholder="مثال: مصر، القاهرة" style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>رقم الهاتف مع رمز الدولة</label>
              <input type="text" placeholder="مثال: 002012345678" style={styles.input} />
            </div>
            
            <button style={{ ...styles.submitBtn, backgroundColor: "#2563eb" }}>حفظ الإعدادات بالكامل</button>
          </div>
        )}

      </div>
    </div>
  );
}
