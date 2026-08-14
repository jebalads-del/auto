'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cars');
  const [data, setData] = useState<any>({});
  const [error, setError] = useState('');

  // التحقق من صلاحيات الأدمن
  useEffect(() => {
    const isAdmin = Cookies.get('isAdmin') || localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
      return;
    }
    fetchData('cars');
  }, []);

  // جلب البيانات حسب التاب المختار
  const fetchData = async (tab: string) => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      if (tab === 'cars') endpoint = '/api/admin/cars';
      else if (tab === 'users') endpoint = '/api/admin/users';
      else if (tab === 'payments') endpoint = '/api/admin/payments';
      else if (tab === 'settings') endpoint = '/api/admin/settings';
      else if (tab === 'premium') endpoint = '/api/admin/premium-ads';
      
      const res = await fetch(endpoint);
      const result = await res.json();
      if (result.success) {
        setData({ ...data, [tab]: result.data || [] });
      } else {
        setError(result.message || 'فشل في جلب البيانات');
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // تغيير التاب
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchData(tab);
  };

  // تحديث حالة السيارة (موافقة / رفض / مباع)
  const updateCarStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/admin/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const result = await res.json();
      if (result.success) {
        fetchData('cars');
      } else {
        alert('فشل في تحديث الحالة');
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  // حذف مستخدم
  const deleteUser = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        fetchData('users');
      } else {
        alert('فشل في حذف المستخدم');
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* الهيدر */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🚗 لوحة تحكم المدير</h1>
          <button
            onClick={() => {
              Cookies.remove('isAdmin');
              localStorage.removeItem('isAdmin');
              router.push('/login');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            تسجيل خروج
          </button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* الأزرار الرئيسية */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => handleTabChange('cars')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'cars' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">🚗</div>
            <div className="font-bold">السيارات</div>
            <div className="text-sm">(إدارة)</div>
          </button>

          <button
            onClick={() => handleTabChange('users')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'users' ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">👥</div>
            <div className="font-bold">المستخدمين</div>
            <div className="text-sm">(إدارة)</div>
          </button>

          <button
            onClick={() => handleTabChange('payments')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'payments' ? 'bg-yellow-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">💰</div>
            <div className="font-bold">خيارات الدفع</div>
            <div className="text-sm">(إعدادات)</div>
          </button>

          <button
            onClick={() => handleTabChange('settings')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'settings' ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">⚙️</div>
            <div className="font-bold">الإعدادات</div>
            <div className="text-sm">(الموقع)</div>
          </button>

          <button
            onClick={() => handleTabChange('premium')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'premium' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">⭐</div>
            <div className="font-bold">إعلانات مميزة</div>
            <div className="text-sm">(مدفوعة)</div>
          </button>
        </div>

        {/* عرض المحتوى حسب التاب المختار */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
          )}

          {/* تبويب السيارات */}
          {activeTab === 'cars' && (
            <div>
              <h2 className="text-xl font-bold mb-4">🚗 إدارة السيارات</h2>
              <div className="flex gap-2 mb-4">
                <button className="bg-yellow-500 text-white px-4 py-2 rounded">قيد المراجعة</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded">تم الموافقة</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded">مباع</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">#</th>
                      <th className="p-2 border">السيارة</th>
                      <th className="p-2 border">السعر</th>
                      <th className="p-2 border">الحالة</th>
                      <th className="p-2 border">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.cars || []).map((car: any, i: number) => (
                      <tr key={car.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{i + 1}</td>
                        <td className="p-2 border">{car.title || car.brand}</td>
                        <td className="p-2 border">{car.price} $</td>
                        <td className="p-2 border">
                          <span className={`px-2 py-1 rounded text-sm ${
                            car.status === 'approved' ? 'bg-green-100 text-green-700' :
                            car.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {car.status === 'approved' ? '✅ موافق' :
                             car.status === 'pending' ? '⏳ قيد المراجعة' :
                             '❌ مرفوض'}
                          </span>
                        </td>
                        <td className="p-2 border">
                          <div className="flex gap-2">
                            {car.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateCarStatus(car.id, 'approved')}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                                >
                                  موافقة
                                </button>
                                <button
                                  onClick={() => updateCarStatus(car.id, 'rejected')}
                                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                                >
                                  رفض
                                </button>
                              </>
                            )}
                            {car.status === 'approved' && (
                              <button
                                onClick={() => updateCarStatus(car.id, 'sold')}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                ✅ مباع
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(data.cars || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-4 text-gray-500">
                          لا توجد سيارات
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب المستخدمين */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold mb-4">👥 إدارة المستخدمين</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">#</th>
                      <th className="p-2 border">الاسم</th>
                      <th className="p-2 border">البريد الإلكتروني</th>
                      <th className="p-2 border">الحالة</th>
                      <th className="p-2 border">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.users || []).map((user: any, i: number) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{i + 1}</td>
                        <td className="p-2 border">{user.name || '—'}</td>
                        <td className="p-2 border">{user.email || '—'}</td>
                        <td className="p-2 border">
                          {user.is_active ? '🟢 نشط' : '🔴 غير نشط'}
                        </td>
                        <td className="p-2 border">
                          <div className="flex gap-2">
                            <button className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">
                              {user.is_active ? 'تعطيل' : 'تفعيل'}
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(data.users || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-4 text-gray-500">
                          لا يوجد مستخدمين
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تبويب خيارات الدفع */}
          {activeTab === 'payments' && (
            <div>
              <h2 className="text-xl font-bold mb-4">💰 خيارات الدفع</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg">💳 باي بال</h3>
                  <input
                    type="text"
                    placeholder="رابط باي بال"
                    className="w-full border rounded p-2 mt-2"
                  />
                  <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600">
                    حفظ
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg">🏦 ويسترن يونيون</h3>
                  <input
                    type="text"
                    placeholder="معلومات ويسترن يونيون"
                    className="w-full border rounded p-2 mt-2"
                  />
                  <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600">
                    حفظ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* تبويب الإعدادات */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-bold mb-4">⚙️ إعدادات الموقع</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-bold">اسم الموقع</label>
                  <input
                    type="text"
                    placeholder="اسم الموقع"
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold">حالة الصيانة</label>
                  <select className="w-full border rounded p-2">
                    <option value="off">🟢 الموقع يعمل</option>
                    <option value="on">🔴 تحت الصيانة</option>
                  </select>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  حفظ الإعدادات
                </button>
              </div>
            </div>
          )}

          {/* تبويب الإعلانات المميزة */}
          {activeTab === 'premium' && (
            <div>
              <h2 className="text-xl font-bold mb-4">⭐ الإعلانات المميزة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg">⭐ مميز</h3>
                  <p className="text-sm text-gray-600">طلبات الإعلانات المدفوعة</p>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded mt-2 hover:bg-orange-600">
                    عرض الطلبات
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg">📋 عادي</h3>
                  <p className="text-sm text-gray-600">الإعلانات العادية</p>
                  <button className="bg-gray-500 text-white px-4 py-2 rounded mt-2 hover:bg-gray-600">
                    عرض الإعلانات
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
