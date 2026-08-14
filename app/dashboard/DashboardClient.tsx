'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cars');
  const [cars, setCars] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // التحقق من صلاحيات الأدمن
  useEffect(() => {
    const adminCheck = Cookies.get('isAdmin') || localStorage.getItem('isAdmin');
    if (!adminCheck) {
      router.push('/login');
      return;
    }
    setIsAdmin(true);
    fetchCars();
    fetchUsers();
  }, []);

  // جلب السيارات
  const fetchCars = async () => {
    try {
      const res = await fetch('/api/cars?_=' + Date.now());
      const data = await res.json();
      if (data.success) {
        setCars(data.cars || []);
      } else {
        setCars(data || []);
      }
    } catch (err) {
      setError('فشل في جلب السيارات');
    } finally {
      setLoading(false);
    }
  };

  // جلب المستخدمين
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?_=' + Date.now());
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // تحديث حالة السيارة
  const updateCarStatus = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/admin/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const result = await res.json();
      if (result.success) {
        alert('تم تحديث الحالة بنجاح');
        fetchCars();
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
        alert('تم حذف المستخدم بنجاح');
        fetchUsers();
      } else {
        alert('فشل في حذف المستخدم');
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* الهيدر */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">🚗 لوحة تحكم المدير</h1>
          <button
            onClick={() => {
              Cookies.remove('isAdmin');
              localStorage.removeItem('isAdmin');
              router.push('/login');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
          >
            تسجيل خروج
          </button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* الأزرار الرئيسية */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setActiveTab('cars')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'cars' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">🚗</div>
            <div className="font-bold text-sm">السيارات</div>
            <div className="text-xs">({cars.length})</div>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'users' ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">👥</div>
            <div className="font-bold text-sm">المستخدمين</div>
            <div className="text-xs">({users.length})</div>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'payments' ? 'bg-yellow-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">💰</div>
            <div className="font-bold text-sm">خيارات الدفع</div>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'settings' ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">⚙️</div>
            <div className="font-bold text-sm">الإعدادات</div>
          </button>

          <button
            onClick={() => setActiveTab('premium')}
            className={`p-4 rounded-lg shadow-md transition ${
              activeTab === 'premium' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl">⭐</div>
            <div className="font-bold text-sm">إعلانات مميزة</div>
          </button>
        </div>

        {/* عرض المحتوى حسب التاب المختار */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : (
            <>
              {/* تبويب السيارات */}
              {activeTab === 'cars' && (
                <div>
                  <div className="flex flex-wrap justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">🚗 إدارة السيارات</h2>
                    <button
                      onClick={() => router.push('/dashboard/cars/new')}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm"
                    >
                      ➕ إضافة سيارة
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border text-right">#</th>
                          <th className="p-2 border text-right">السيارة</th>
                          <th className="p-2 border text-right">السعر</th>
                          <th className="p-2 border text-right">الحالة</th>
                          <th className="p-2 border text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cars.map((car: any, i: number) => (
                          <tr key={car.id} className="hover:bg-gray-50">
                            <td className="p-2 border">{i + 1}</td>
                            <td className="p-2 border">{car.title || car.brand || 'سيارة'}</td>
                            <td className="p-2 border">{car.price} $</td>
                            <td className="p-2 border">
                              <span className={`px-2 py-1 rounded text-xs ${
                                car.status === 'approved' ? 'bg-green-100 text-green-700' :
                                car.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                car.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {car.status === 'approved' ? '✅ موافق' :
                                 car.status === 'pending' ? '⏳ قيد المراجعة' :
                                 car.status === 'sold' ? '💰 مباع' :
                                 '❌ مرفوض'}
                              </span>
                            </td>
                            <td className="p-2 border">
                              <div className="flex flex-wrap gap-2">
                                {car.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateCarStatus(car.id, 'approved')}
                                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                    >
                                      موافقة
                                    </button>
                                    <button
                                      onClick={() => updateCarStatus(car.id, 'rejected')}
                                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                    >
                                      رفض
                                    </button>
                                  </>
                                )}
                                {car.status === 'approved' && (
                                  <button
                                    onClick={() => updateCarStatus(car.id, 'sold')}
                                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                  >
                                    ✅ مباع
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    if (confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
                                      updateCarStatus(car.id, 'deleted');
                                    }
                                  }}
                                  className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                                >
                                  🗑️ حذف
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {cars.length === 0 && (
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
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border text-right">#</th>
                          <th className="p-2 border text-right">الاسم</th>
                          <th className="p-2 border text-right">البريد الإلكتروني</th>
                          <th className="p-2 border text-right">الحالة</th>
                          <th className="p-2 border text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user: any, i: number) => {
                          const isAdminUser = user.email?.toLowerCase().includes('admin') || user.name?.toLowerCase().includes('admin');
                          return (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="p-2 border">{i + 1}</td>
                              <td className="p-2 border">
                                {user.name || '—'}
                                {isAdminUser && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded mr-2">مسؤول</span>}
                              </td>
                              <td className="p-2 border">{user.email || '—'}</td>
                              <td className="p-2 border">
                                {user.is_active ? '🟢 نشط' : '🔴 غير نشط'}
                              </td>
                              <td className="p-2 border">
                                <div className="flex flex-wrap gap-2">
                                  <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">
                                    {user.is_active ? 'تعطيل' : 'تفعيل'}
                                  </button>
                                  {!isAdminUser && (
                                    <button
                                      onClick={() => deleteUser(user.id)}
                                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                    >
                                      حذف
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {users.length === 0 && (
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
                      <p className="text-sm text-gray-500 mb-2">إعدادات بوابة الدفع</p>
                      <input
                        type="text"
                        placeholder="رابط باي بال"
                        className="w-full border rounded p-2 mt-2 text-sm"
                        defaultValue="example@paypal.com"
                      />
                      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 text-sm w-full">
                        حفظ
                      </button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-bold text-lg">🏦 ويسترن يونيون</h3>
                      <p className="text-sm text-gray-500 mb-2">معلومات التحويل</p>
                      <input
                        type="text"
                        placeholder="معلومات ويسترن يونيون"
                        className="w-full border rounded p-2 mt-2 text-sm"
                        defaultValue="تفاصيل الاستلام..."
                      />
                      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 text-sm w-full">
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
                  <div className="grid grid-cols-1 gap-4 max-w-lg">
                    <div>
                      <label className="block font-bold text-sm">اسم الموقع</label>
                      <input
                        type="text"
                        className="w-full border rounded p-2 mt-1 text-sm"
                        defaultValue="منصة إعلانات السيارات"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-sm">حالة الصيانة</label>
                      <select className="w-full border rounded p-2 mt-1 text-sm">
                        <option value="off">🟢 الموقع يعمل</option>
                        <option value="on">🔴 تحت الصيانة</option>
                      </select>
                    </div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
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
                      <button className="bg-orange-500 text-white px-4 py-2 rounded mt-2 hover:bg-orange-600 text-sm w-full">
                        عرض الطلبات
                      </button>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-bold text-lg">📋 عادي</h3>
                      <p className="text-sm text-gray-600">الإعلانات العادية</p>
                      <button className="bg-gray-500 text-white px-4 py-2 rounded mt-2 hover:bg-gray-600 text-sm w-full">
                        عرض الإعلانات
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
