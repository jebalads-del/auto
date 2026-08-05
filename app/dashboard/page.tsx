'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  
  // بيانات المستخدمين
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({});

  // التحقق من صلاحية المدير
  useEffect(() => {
    const isAdmin = Cookies.get('isAdmin') || localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [usersRes, adsRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/users').catch(() => null),
        fetch('/api/admin/ads').catch(() => null),
        fetch('/api/admin/payments').catch(() => null)
      ]);

      const usersData = usersRes ? await usersRes.json() : null;
      const adsData = adsRes ? await adsRes.json() : null;
      const paymentsData = paymentsRes ? await paymentsRes.json() : null;

      if (usersData?.success) setUsers(usersData.users || []);
      if (adsData?.success) setAds(adsData.ads || []);
      if (paymentsData?.success) setPayments(paymentsData.payments || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-center">لوحة تحكم المدير</h1>

      {/* تبويبات التنقل */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded transition ${
            activeTab === 'users' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          👥 المستخدمين ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2 rounded transition ${
            activeTab === 'ads' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          📋 الإعلانات ({ads.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded transition ${
            activeTab === 'payments' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          💳 المدفوعات ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded transition ${
            activeTab === 'settings' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          ⚙️ الإعدادات
        </button>
      </div>

      {/* محتوى المستخدمين */}
      {activeTab === 'users' && (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">👥 المستخدمين</h2>
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا يوجد مستخدمين</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-right">#</th>
                  <th className="p-2 border text-right">الاسم</th>
                  <th className="p-2 border text-right">البريد الإلكتروني</th>
                  <th className="p-2 border text-right">الهاتف</th>
                  <th className="p-2 border text-right">الحالة</th>
                  <th className="p-2 border text-right">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{user.name || 'غير معروف'}</td>
                    <td className="p-2 border">{user.email || 'لا يوجد'}</td>
                    <td className="p-2 border">{user.phone || 'لا يوجد'}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.is_premium 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {user.is_premium ? '⭐ Premium' : 'عادي'}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-KW') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* محتوى الإعلانات */}
      {activeTab === 'ads' && (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">📋 الإعلانات</h2>
          {ads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد إعلانات</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-right">#</th>
                  <th className="p-2 border text-right">العنوان</th>
                  <th className="p-2 border text-right">المالك</th>
                  <th className="p-2 border text-right">السعر</th>
                  <th className="p-2 border text-right">الحالة</th>
                  <th className="p-2 border text-right">تاريخ النشر</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad: any, index) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{ad.title || 'بدون عنوان'}</td>
                    <td className="p-2 border">{ad.user_name || 'غير معروف'}</td>
                    <td className="p-2 border">{ad.price || 0} د.ع</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-sm ${
                        ad.status === 'approved' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {ad.status === 'approved' ? '✅ مقبول' : '⏳ قيد المراجعة'}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {ad.created_at ? new Date(ad.created_at).toLocaleDateString('ar-KW') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* محتوى المدفوعات */}
      {activeTab === 'payments' && (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">💳 المدفوعات</h2>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد مدفوعات</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-right">#</th>
                  <th className="p-2 border text-right">المستخدم</th>
                  <th className="p-2 border text-right">المبلغ</th>
                  <th className="p-2 border text-right">الحالة</th>
                  <th className="p-2 border text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any, index) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{payment.user_name || 'غير معروف'}</td>
                    <td className="p-2 border">{payment.amount || 0} د.ع</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-sm ${
                        payment.status === 'completed' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {payment.status === 'completed' ? '✅ مكتمل' : '⏳ معلق'}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString('ar-KW') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* محتوى الإعدادات */}
      {activeTab === 'settings' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">⚙️ الإعدادات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">🔧 إعدادات الموقع</h3>
              <p className="text-sm text-gray-500">يمكنك إضافة إعدادات الموقع هنا</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-2">📊 إحصائيات</h3>
              <p className="text-sm text-gray-500">عدد المستخدمين: {users.length}</p>
              <p className="text-sm text-gray-500">عدد الإعلانات: {ads.length}</p>
              <p className="text-sm text-gray-500">عدد المدفوعات: {payments.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
