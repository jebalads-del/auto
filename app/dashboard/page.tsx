"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("ads");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [imgCount, setImgCount] = useState(0);

  const data: { [key: string]: string[] } = {
    "تويوتا": ["كامري", "كورولا", "لاندكروزر"],
    "مرسيدس": ["C-Class", "E-Class", "S-Class"],
    "بي إم دبليو": ["الفئة 3", "الفئة 5", "X5"],
    "نيسان": ["صني", "ألتيما", "باترول"],
    "هيونداي": ["إلنترا", "سوناتا", "توسان"],
    "كيا": ["سيراتو", "سبورتج", "سورينتو"]
  };

  const sty = {
    in: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px", boxSizing: "border-box" as const }
  };

  return (
    <div style={{ direction: "rtl", textAlign: "right", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "15px", borderRadius: "12px", textAlign: "center", marginBottom: "15px" }}>
        <h2 style={{ textAlign: "center", margin: "0 0 10px 0" }}>🛠️ لوحة التحكم</h2>
        <div style={{ display: "flex", gap: "5px" }}>
          <button onClick={() => setTab("ads")} style={{ flex: 1, padding: "8px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px" }}>🚗 الإعلانات</button>
          <button onClick={() => setTab("users")} style={{ flex: 1, padding: "8px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>👥 المستخدمين</button>
          <button onClick={() => setTab("pay")} style={{ flex: 1, padding: "8px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "6px" }}>⚙️ الدفع</button>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #eee" }}>
        {tab === "ads" && (
          <div>
            <h3>إضافة إعلان جديد</h3>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); }} style={sty.in}>
              <option value="">اختر الماركة</option>
              {Object.keys(data).map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} style={sty.in}>
              <option value="">اختر الموديل</option>
              {brand && data[brand].map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <input type="number" placeholder="السعر ($) - يدوي" style={sty.in} />
            
            <select style={sty.in}><option>اختر السنة</option>{Array.from({ length: 27 }, (_, i) => 2026 - i).map(y => <option key={y}>{y}</option>)}</select>
            <select style={sty.in}><option>المسافة (كم)</option><option>0 (وكالة)</option><option>1-50 ألف</option><option>50-100 ألف</option><option>+100 ألف</option></select>
            <select style={sty.in}><option>اختر اللون</option><option>أبيض</option><option>أسود</option><option>فضي</option><option>رمادي</option><option>أزرق</option></select>
            
            <div style={{ border: "2px dashed #ccc", padding: "10px", borderRadius: "8px", marginBottom: "12px", cursor: "pointer" }}>
              <input type="file" multiple accept="image/*" onChange={(e) => setImgCount(e.target.files?.length || 0)} style={{ display: "none" }} id="files" />
              <label htmlFor="files" style={{ display: "block", textAlign: "center", cursor: "pointer" }}>
                📷 {imgCount > 0 ? `تم اختيار ${imgCount} صور` : "اضغط هنا لاختيار صور السيارة"}
              </label>
            </div>

            <textarea placeholder="معلومات إضافية..." rows={3} style={sty.in}></textarea>
            <button style={{ width: "100%", padding: "10px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "8px" }}>نشر الإعلان</button>
          </div>
        )}

        {tab === "users" && <div style={{ padding: "10px", border: "1px solid #ddd" }}><b>أحمد محمد</b> (ahmed@example.com)</div>}

        {tab === "pay" && (
          <div>
            <h3>إعدادات الدفع</h3>
            <input placeholder="حساب PayPal المستلم" style={sty.in} />
            <h4>Western Union</h4>
            <input placeholder="اسم المستلم الكامل" style={sty.in} />
            <input placeholder="الدولة والمدينة" style={sty.in} />
            <input placeholder="رقم الهاتف" style={sty.in} />
            <button style={{ width: "100%", padding: "10px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px" }}>حفظ الإعدادات</button>
          </div>
        )}
      </div>
    </div>
  );
}
