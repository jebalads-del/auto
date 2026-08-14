'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cars');
  const [cars, setCars] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, sold: 0 });

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

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/cars?_=' + Date.now());
      const data = await res.json();
      const carsData = data.success ? data.cars || [] : data || [];
      setCars(carsData);
      
      const pending = carsData.filter((c: any) => c.status === 'pending').length;
      const approved = carsData.filter((c: any) => c.status === 'approved' || c.status === 'active').length;
      const sold = carsData.filter((c: any) => c.status === 'sold').length;
      setStats({ pending, approved, sold });
    } catch (err) {
      setError('فشل في جلب السيارات');
    } finally {
      setLoading(false);
    }
  };

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

  const updateCarStatus = async (id: number, status: string) => {
    if (!confirm(`هل أنت متأكد من ${status === 'approved' ? 'الموافقة على' : status === 'rejected' ? 'رفض' : 'تحديث'} هذه السيارة؟`)) return;
    try {
      const res = await fetch('/api/admin/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const result = await res.json();
      if (result.success) {
        alert('✅ تم تحديث الحالة بنجاح');
        fetchCars();
      } else {
        alert('❌ فشل في تحديث الحالة');
      }
    } catch (err) {
      alert('❌ حدث خطأ');
    }
  };

  const deleteCar = async (id: number) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه السيارة نهائياً؟')) return;
    try {
      const res = await fetch(`/api/admin/cars?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        alert('🗑️ تم حذف السيارة بنجاح');
        fetchCars();
      } else {
        alert('❌ فشل في حذف السيارة');
      }
    } catch (err) {
      alert('❌ حدث خطأ');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        alert('🗑️ تم حذف المستخدم بنجاح');
        fetchUsers();
      } else {
        alert('❌ فشل في حذف المستخدم');
      }
    } catch (err) {
      alert('❌ حدث خطأ');
    }
  };

  const toggleUserStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`✅ تم ${currentStatus ? 'تعطيل' : 'تفعيل'} المستخدم بنجاح`);
        fetchUsers();
      } else {
        alert('❌ فشل في تحديث حالة المستخدم');
      }
    } catch (err) {
      alert('❌ حدث خطأ');
    }
  };

  if (!isAdmin) return null;

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
        {/* الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-blue-500">
            <div className="text-2xl">🚗</div>
            <div className="text-sm text-gray-500">إجمالي السيارات</div>
            <div className="text-2xl font-bold text-blue-600">{cars.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-yellow-500">
            <div className="text-2xl">⏳</div>
            <div className="text-sm text-gray-500">قيد المراجعة</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-green-500">
            <div className="text-2xl">✅</div>
            <div className="text-sm text-gray-500">تم الموافقة</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-r-4 border-purple-500">
            <div className="text-2xl">👥</div>
            <div className="text-sm text-gray-500">المستخدمين</div>
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
          </div>
        </div>

        {/* الأزرار الرئيسية */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { id: 'cars', icon: '🚗', label: 'السيارات' },
            { id: 'users', icon: '👥', label: 'المستخدمين' },
            { id: 'payments', icon: '💳', label: 'خيارات الدفع' },
            { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
            { id: 'premium', icon: '⭐', label: 'إعلانات مميزة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-xl shadow-md transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="text-2xl">{tab.icon}</div>
              <div className="font-bold text-sm">{tab.label}</div>
            </button>
          ))}
        </div>

        {/* المحتوى */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-4">
              ❌ {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-500">⏳ جاري التحميل...</div>
          ) : (
            <>
              {/* تبويب السيارات */}
              {activeTab === 'cars' && (
                <div>
                  <div className="flex flex-wrap justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">🚗 إدارة السيارات</h2>
                    <button
                      onClick={() => router.push('/dashboard/cars/new')}
                      className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 text-sm"
                    >
                      ➕ إضافة سيارة
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 border text-right">#</th>
                          <th className="p-3 border text-right">السيارة</th>
                          <th className="p-3 border text-right">السعر</th>
                          <th className="p-3 border text-right">الحالة</th>
                          <th className="p-3 border text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cars.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-gray-400">📭 لا توجد سيارات</td>
                          </tr>
                        ) : (
                          cars.map((car: any, i: number) => (
                            <tr key={car.id} className="hover:bg-blue-50 transition border-b">
                              <td className="p-3 border text-center">{i + 1}</td>
                              <td className="p-3 border">{car.title || car.brand || 'سيارة'}</td>
                              <td className="p-3 border font-bold text-blue-600">{car.price} KWD</td>
                              <td className="p-3 border">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  car.status === 'approved' || car.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : car.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : car.status === 'sold' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {car.status === 'approved' || car.status === 'active' ? '✅ موافق' :
                                   car.status === 'pending' ? '⏳ قيد المراجعة' :
                                   car.status === 'sold' ? '💰 مباع' :
                                   '❌ مرفوض'}
                                </span>
                              </td>
                              <td className="p-3 border">
                                <div className="flex flex-wrap gap-2">
                                  {car.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => updateCarStatus(car.id, 'approved')}
                                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-600"
                                      >
                                        ✅ موافقة
                                      </button>
                                      <button
                                        onClick={() => updateCarStatus(car.id, 'rejected')}
                                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600"
                                      >
                                        ❌ رفض
                                      </button>
                                    </>
                                  )}
                                  {car.status === 'approved' && (
                                    <button
                                      onClick={() => updateCarStatus(car.id, 'sold')}
                                      className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-purple-600"
                                    >
                                      💰 مباع
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteCar(car.id)}
                                    className="bg-gray-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-gray-600"
                                  >
                                    🗑️ حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* تبويب المستخدمين */}
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">👥 إدارة المستخدمين</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 border text-right">#</th>
                          <th className="p-3 border text-right">الاسم</th>
                          <th className="p-3 border text-right">البريد الإلكتروني</th>
                          <th className="p-3 border text-right">الحالة</th>
                          <th className="p-3 border text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-gray-400">📭 لا يوجد مستخدمين</td>
                          </tr>
                        ) : (
                          users.map((user: any, i: number) => {
                            const isAdminUser = user.email?.toLowerCase().includes('admin') || user.name?.toLowerCase().includes('admin');
                            return (
                              <tr key={user.id} className="hover:bg-blue-50 transition border-b">
                                <td className="p-3 border text-center">{i + 1}</td>
                                <td className="p-3 border">
                                  {user.name || '—'}
                                  {isAdminUser && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">مسؤول</span>}
                                </td>
                                <td className="p-3 border">{user.email || '—'}</td>
                                <td className="p-3 border">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {user.is_active ? '🟢 نشط' : '🔴 غير نشط'}
                                  </span>
                                </td>
                                <td className="p-3 border">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                                      className={`px-3 py-1.5 rounded-lg text-xs ${
                                        user.is_active 
                                          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                          : 'bg-green-500 text-white hover:bg-green-600'
                                      }`}
                                    >
                                      {user.is_active ? 'تعطيل' : 'تفعيل'}
                                    </button>
                                    {!isAdminUser && (
                                      <button
                                        onClick={() => deleteUser(user.id)}
                                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600"
                                      >
                                        حذف
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* تبويب خيارات الدفع */}
              {activeTab === 'payments' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">💳 خيارات الدفع</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-xl p-6">
                      <h3 className="font-bold text-lg">💳 باي بال</h3>
                      <input type="text" placeholder="رابط باي بال" className="w-full border rounded p-3 mt-2 text-sm" />
                      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-3 hover:bg-blue-600 text-sm w-full">💾 حفظ</button>
                    </div>
                    <div className="border rounded-xl p-6">
                      <h3 className="font-bold text-lg">🏦 ويسترن يونيون</h3>
                      <textarea placeholder="معلومات ويسترن يونيون" className="w-full border rounded p-3 mt-2 text-sm" rows={3} />
                      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-3 hover:bg-blue-600 text-sm w-full">💾 حفظ</button>
                    </div>
                  </div>
                </div>
              )}

              {/* تبويب الإعدادات */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ إعدادات الموقع</h2>
                  <div className="max-w-lg">
                    <div className="mb-4">
                      <label className="block font-bold text-sm">اسم الموقع</label>
                      <input type="text" className="w-full border rounded p-3 mt-1 text-sm" defaultValue="🚗 منصة إعلانات السيارات" />
                    </div>
                    <div className="mb-4">
                      <label className="block font-bold text-sm">حالة الصيانة</label>
                      <select className="w-full border rounded p-3 mt-1 text-sm">
                        <option value="off">🟢 الموقع يعمل</option>
                        <option value="on">🔴 تحت الصيانة</option>
                      </select>
                    </div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm w-full">💾 حفظ الإعدادات</button>
                  </div>
                </div>
              )}

              {/* تبويب الإعلانات المميزة */}
              {activeTab === 'premium' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ الإعلانات المميزة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-xl p-6">
                      <h3 className="font-bold text-lg">⭐ مميز</h3>
                      <p className="text-sm text-gray-500">طلبات الإعلانات المدفوعة</p>
                      <button className="bg-orange-500 text-white px-4 py-2 rounded mt-3 hover:bg-orange-600 text-sm w-full">📋 عرض الطلبات</button>
                    </div>
                    <div className="border rounded-xl p-6">
                      <h3 className="font-bold text-lg">📋 عادي</h3>
                      <p className="text-sm text-gray-500">الإعلانات العادية</p>
                      <button className="bg-gray-500 text-white px-4 py-2 rounded mt-3 hover:bg-gray-600 text-sm w-full">📋 عرض الإعلانات</button>
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
