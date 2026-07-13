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
    <div className="min-h-screen bg-slate-50 p-4 w-full" style={{ direction: 'rtl' }}>
      {/* الهيدر العلوي */}
      <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-xl p-5 shadow-md mb-5 text-center">
        <h1 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
          🛠️ لوحة تحكم الإدارة
        </h1>
        {/* أزرار القسم العلوي متناسقة للهاتف */}
        <div className="flex flex-wrap gap-2 justify-center w-full">
          <button 
            onClick={() => setActiveTab("ads")} 
            className={`flex-1 min-w-[100px] text-sm py-2 px-3 rounded-lg font-medium transition ${activeTab === "ads" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            🚗 الإعلانات
          </button>
          <button 
            onClick={() => setActiveTab("users")} 
            className={`flex-1 min-w-[100px] text-sm py-2 px-3 rounded-lg font-medium transition ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            👥 المستخدمين
          </button>
          <button 
            onClick={() => setActiveTab("settings")} 
            className={`flex-1 min-w-[100px] text-sm py-2 px-3 rounded-lg font-medium transition ${activeTab === "settings" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            ⚙️ إعدادات الدفع
          </button>
        </div>
      </div>

      {/* صندوق المحتوى الرئيسي */}
      <div className="max-w-xl mx-auto bg-white rounded-xl p-5 shadow-sm border border-slate-200 text-right">
        
        {/* قسم إضافة إعلان جديد */}
        {activeTab === "ads" && (
          <div className="space-y-4 w-full">
            <h2 className="font-bold text-lg text-slate-800 pb-2 border-b">إضافة إعلان جديد</h2>
            
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-600 mb-1">ماركة السيارة</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">اختر ماركة السيارة</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-600 mb-1">الموديل</label>
              <select disabled={!brand} className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                <option value="">اختر الموديل</option>
                {brand && models[brand]?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
              <input type="number" placeholder="مثال: 2024" className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" />
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-600 mb-1">الكيلومترات</label>
              <input type="number" placeholder="أدخل المسافة المقطوعة" className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" />
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-600 mb-1">اللون</label>
              <input type="text" placeholder="لون السيارة" className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" />
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold text-slate-600 mb-1">معلومات إضافية</label>
              <textarea placeholder="اكتب تفاصيل إضافية هنا..." rows={3} className="w-full p-3 border rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"></textarea>
            </div>

            <button className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 transition shadow-sm">
              نشر الإعلان
            </button>
          </div>
        )}

        {/* قسم إدارة المستخدمين */}
        {activeTab === "users" && (
          <div className="w-full space-y-3">
            <h2 className="font-bold text-lg text-slate-800 pb-2 border-b">إدارة مستخدمين الموقع</h2>
            <div className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center text-sm">
              <div>
                <div className="font-bold text-slate-800">أحمد محمد</div>
                <div className="text-xs text-slate-500">ahmed@example.com</div>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md transition">حظر</button>
            </div>
          </div>
        )}

        {/* قسم إعدادات الدفع */}
        {activeTab === "settings" && (
          <div className="w-full space-y-4">
            <div>
              <h2 className="font-bold text-lg text-slate-800 mb-1">بوابة PayPal</h2>
              <p className="text-xs text-slate-500 mb-2">أدخل البريد الإلكتروني المخصص لاستلام الأموال آلياً.</p>
              <input type="email" placeholder="example@paypal.com" className="w-full p-3 border rounded-lg bg-slate-50 text-left" style={{ direction: 'ltr' }} />
            </div>
            
            <div className="border-t pt-3">
              <h2 className="font-bold text-lg text-slate-800 mb-1">بوابة Western Union</h2>
              <p className="text-xs text-slate-500 mb-3">بيانات الدفع اليدوي التي ستظهر للمشترين.</p>
              
              <div className="space-y-3">
                <input type="text" placeholder="اسم المستلم الكامل (باللغة الإنجليزية)" className="w-full p-3 border rounded-lg bg-slate-50 text-right" />
                <input type="text" placeholder="الدولة والمدينة" className="w-full p-3 border rounded-lg bg-slate-50 text-right" />
                <input type="text" placeholder="رقم الهاتف مع رمز الدولة" className="w-full p-3 border rounded-lg bg-slate-50 text-right" />
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">
              حفظ الإعدادات بالكامل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
