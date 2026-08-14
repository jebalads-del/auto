'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');

  useEffect(() => {
    // التحقق من صلاحية المدير
    const isAdmin = Cookies.get('isAdmin') || localStorage.getItem('isAdmin');
    const userEmail = Cookies.get('userEmail') || localStorage.getItem('userEmail');
    
    // السماح فقط للمدير
    if (!isAdmin || !userEmail || !userEmail.includes('admin')) {
      router.push('/login');
      return;
    }

    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // جلب المستخدمين
      const usersRes = await fetch('/api/admin/users').catch(() => null);
      const usersData = usersRes ? await usersRes.json() : null;
      if (usersData?.success) setUsers(usersData.users || []);

      // جلب الإعلانات
      const adsRes = await fetch('/api/admin/ads').catch(() => null);
      const adsData = adsRes ? await adsRes.json() : null;
      if (adsData?.success) setAds(adsData.ads || []);

      // جلب المدفوعات
      const paymentsRes = await fetch('/api/admin/payments').catch(() => null);
      const paymentsData = paymentsRes ? await paymentsRes.json() : null;
      if (paymentsData?.success) setPayments(paymentsData.payments || []);

    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError('حدث خطأ في جلب البيانات');
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-center">لوحة تحكم المدير</h1>

      {/* علامات التبويب */}
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

      {/* محتوى التبويب النشط */}
      {activeTab === 'users' && (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">👥 المستخدمين</h2>
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا يوجد مستخدمين</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-right border">#</th>
                  <th className="p-2 text-right border">الاسم</th>
                  <th className="p-2 text-right border">البريد الإلكتروني</th>
                  <th className="p-2 text-right border">الهاتف</th>
                  <th className="p-2 text-right border">الحالة</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">📋 الإعلانات</h2>
          {ads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد إعلانات</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-right border">#</th>
                  <th className="p-2 text-right border">العنوان</th>
                  <th className="p-2 text-right border">المالك</th>
                  <th className="p-2 text-right border">السعر</th>
                  <th className="p-2 text-right border">الحالة</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">💳 المدفوعات</h2>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد مدفوعات</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-right border">#</th>
                  <th className="p-2 text-right border">المستخدم</th>
                  <th className="p-2 text-right border">المبلغ</th>
                  <th className="p-2 text-right border">التاريخ</th>
                  <th className="p-2 text-right border">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any, index) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{payment.user_name || 'غير معروف'}</td>
                    <td className="p-2 border">{payment.amount || 0} د.ع</td>
                    <td className="p-2 border">
                      {payment.created_at 
                        ? new Date(payment.created_at).toLocaleDateString('ar-KW')
                        : 'غير محدد'
                      }
                    </td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-sm ${
                        payment.status === 'completed' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {payment.status === 'completed' ? '✅ مكتمل' : '⏳ قيد المعالجة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">⚙️ الإعدادات</h2>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">صفحة الإعدادات قيد التطوير</p>
            <p className="text-sm text-gray-400 mt-2">يمكنك إضافة إعدادات الموقع هنا</p>
          </div>
        </div>
      )}
    </div>
  );
}
