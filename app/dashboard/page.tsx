"use client";
import React, { useState } from 'react';

// أمثلة لبيانات وهمية - استبدلها بالطريقة التي تجلب بها بياناتك من Neon DB
const initialUsers = [
  { id: 1, name: "KXRIDLKYQilRqlkIhh", email: "ak-jak@hotmail.com", phone: "لا يوجد", status: "عادي", date: "٢٠٢٦/٠٧/٣١" },
  { id: 2, name: "qELzFnGDEnhVqOMZCTWuhNQ", email: "karen@advancedlightandsound.com", phone: "لا يوجد", status: "عادي", date: "٢٠٢٦/٠٧/٣١" },
  // ... بقية المستخدمين يتم جلبهم من قاعدة البيانات
];

export default function Dashboard() {
  // حالة التبويب النشط حالياً
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'payments' | 'settings'>('users');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans" dir="rtl">
      
      {/* الهيدر العلوي */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span>📊</span> لوحة تحكم المدير
          </h1>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            مستضاف على Vercel & Neon DB
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* أزرار التنقل (التبويبات) المحدثة والمحسنة للهاتف */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            👥 المستخدمين <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>43</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'ads'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            🚗 إعلانات السيارات <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'ads' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>0</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            💳 خيارات الدفع <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'payments' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>0</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            ⚙️ إعدادات الموقع
          </button>
        </div>

        {/* عرض المحتوى بناءً على التبويب النشط */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
          
          {/* 1. قسم المستخدمين */}
          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-700 border-r-4 border-blue-600 pr-2">جدول إدارة المستخدمين</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-right border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-sm">
                      <th className="p-4 w-12">#</th>
                      <th className="p-4">الاسم</th>
                      <th className="p-4">البريد الإلكتروني</th>
                      <th className="p-4">الهاتف</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {initialUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-400 font-mono">{user.id}</td>
                        <td className="p-4 font-medium text-gray-900 max-w-[200px] truncate">{user.name}</td>
                        <td className="p-4 text-blue-600 font-mono text-xs">{user.email}</td>
                        <td className="p-4 text-gray-500">{user.phone}</td>
                        <td className="p-4">
                          <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium">
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 text-xs">{user.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. قسم إعلانات السيارات */}
          {activeTab === 'ads' && (
            <div className="p-6 text-center py-12">
              <div className="text-4xl mb-3">🚗</div>
              <h2 className="text-xl font-bold mb-2 text-gray-700">إعلانات السيارات</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">هنا يمكنك التحكم في الإعلانات المضافة، الموافقة عليها أو حذفها.</p>
              <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-gray-400">
                لا توجد إعلانات سيارات بانتظار المراجعة حالياً.
              </div>
            </div>
          )}

          {/* 3. قسم خيارات الدفع */}
          {activeTab === 'payments' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-700 border-r-4 border-blue-600 pr-2">خيارات وبوابات الدفع</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">الدفع عند الاستلام / كاش</h3>
                    <p className="text-xs text-gray-500 mt-1">تفعيل أو تعطيل الدفع اليدوي</p>
                  </div>
                  <span className="text-green-600 text-sm font-medium">نشط</span>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">بوابة الدفع الإلكتروني (KNET/Stripe)</h3>
                    <p className="text-xs text-gray-500 mt-1">إعدادات الربط مع البنك</p>
                  </div>
                  <span className="text-gray-400 text-sm font-medium">غير مهيأ</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. قسم إعدادات الموقع */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-700 border-r-4 border-blue-600 pr-2">إعدادات الموقع العامة</h2>
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموقع</label>
                  <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="موقع حراج السيارات" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني للدعم</label>
                  <input type="email" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="support@site.com" />
                </div>
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow">
                  حفظ التعديلات
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
