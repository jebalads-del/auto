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

  return (
    <div className="min-h-screen bg-slate-50 p-4" style={{ direction: 'rtl', textAlign: 'right' }}>
      <div className="max-w-xl mx-auto bg-slate-950 text-white rounded-xl p-4 shadow-md mb-4">
        <h1 className="text-xl font-bold text-center mb-4">🛠️ لوحة تحكم الإدارة</h1>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button onClick={() => setActiveTab("ads")} className={`p-2 rounded ${activeTab === "ads" ? "bg-blue-600" : "bg-slate-800"}`}>🚗 الإعلانات</button>
          <button onClick={() => setActiveTab("users")} className={`p-2 rounded ${activeTab === "users" ? "bg-blue-600" : "bg-slate-800"}`}>👥 المستخدمين</button>
          <button onClick={() => setActiveTab("settings")} className={`p-2 rounded ${activeTab === "settings" ? "bg-blue-600" : "bg-slate-800"}`}>⚙️ إعدادات الدفع</button>
        </div>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-xl p-4 shadow-sm border">
        {activeTab === "ads" && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg">إضافة إعلان جديد</h2>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-2 border rounded bg-slate-50">
              <option value="">اختر ماركة السيارة</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select disabled={!brand} className="w-full p-2 border rounded bg-slate-50 disabled:opacity-50">
              <option value="">اختر الموديل</option>
              {brand && models[brand]?.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="number" placeholder="السنة (مثال: 2024)" className="w-full p-2 border rounded bg-slate-50" />
            <input type="number" placeholder="الكيلومترات" className="w-full p-2 border rounded bg-slate-50" />
            <input type="text" placeholder="اللون" className="w-full p-2 border rounded bg-slate-50" />
            <textarea placeholder="معلومات إضافية..." rows={3} className="w-full p-2 border rounded bg-slate-50"></textarea>
            <button className="w-full bg-emerald-600 text-white p-2 rounded font-bold">نشر الإعلان</button>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="font-bold text-lg mb-2">إدارة مستخدمين الموقع</h2>
            <p className="text-sm text-slate-500 mb-2">قائمة الأعضاء المسجلين:</p>
            <div className="p-2 border rounded flex justify-between items-center text-sm mb-2">
              <div><b>أحمد محمد</b> (ahmed@example.com)</div>
              <button className="bg-red-500 text-white text-xs px-2 py-1 rounded">حظر</button>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-lg mb-2">بوابة PayPal</h2>
              <input type="email" placeholder="حساب PayPal المستلم" className="w-full p-2 border rounded bg-slate-50" />
            </div>
            <div className="border-t pt-3">
              <h2 className="font-bold text-lg mb-2">بوابة Western Union</h2>
              <input type="text" placeholder="اسم المستلم الكامل" className="w-full p-2 border rounded bg-slate-50 mb-2" />
              <input type="text" placeholder="الدولة والمدينة" className="w-full p-2 border rounded bg-slate-50 mb-2" />
              <input type="text" placeholder="رقم الهاتف" className="w-full p-2 border rounded bg-slate-50" />
            </div>
            <button className="w-full bg-blue-600 text-white p-2 rounded font-bold">حفظ الإعدادات</button>
          </div>
        )}
      </div>
    </div>
  );
}
