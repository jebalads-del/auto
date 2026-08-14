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
      
      // حساب الإحصائيات
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      {/* الهيدر */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚗</span>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              لوحة تحكم المدير
            </h1>
          </div>
          <button
            onClick={() => {
              Cookies.remove('isAdmin');
              localStorage.removeItem('isAdmin');
              router.push('/login');
            }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all text-sm font-medium"
          >
            🚪 تسجيل خروج
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
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
            { id: 'cars', icon: '🚗', label: 'السيارات', count: cars.length },
            { id: 'users', icon: '👥', label: 'المستخدمين', count: users.length },
            { id: 'payments', icon: '💳', label: 'خيارات الدفع' },
            { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
            { id: 'premium', icon: '⭐', label: 'إعلانات مميزة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-xl shadow-md transition-all transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="text-2xl">{tab.icon}</div>
              <div className="font-bold text-sm">{tab.label}</div>
              {tab.count !== undefined && (
                <div className={`text-xs ${activeTab === tab.id ? 'text-blue-200' : 'text-gray-400'}`}>
                  ({tab.count})
                </div>
              )}
            </button>
          ))}
        </div>

        {/* المحتوى */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 m-4 rounded-lg border border-red-200">
              ❌ {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-500">⏳ جاري التحميل...</div>
          ) : (
            <div className="p-4 md:p-6">
              {/* تبويب السيارات */}
              {activeTab === 'cars' && (
                <div>
                  <div className="flex flex-wrap justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">🚗 إدارة السيارات</h2>
                    <button
                      onClick={() => router.push('/dashboard/cars/new')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                    >
                      ➕ إضافة سيارة
                    </button>
                  </div>

                  {/* فلاتر */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition">
                      الكل ({cars.length})
                    </button>
                    <button className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-200 transition">
                      ⏳ قيد المراجعة ({stats.pending})
                    </button>
                    <button className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition">
                      ✅ موافق ({stats.approved})
                    </button>
                    <button className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition">
                      💰 مباع ({stats.sold})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                          <th className="p-3 border text-right rounded-tr-lg">#</th>
                          <th className="p-3 border text-right">السيارة</th>
                          <th className="p-3 border text-right">السعر</th>
                          <th className="p-3 border text-right">الحالة</th>
                          <th className="p-3 border text-right rounded-tl-lg">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cars.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-gray-400">
                              📭 لا توجد سيارات حالياً
                            </td>
                          </tr>
                        ) : (
                          cars.map((car: any, i: number) => (
                            <tr key={car.id} className="hover:bg-blue-50 transition border-b">
                              <td className="p-3 border text-center font-medium">{i + 1}</td>
                              <td className="p-3 border">
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {car.title || car.brand || 'سيارة'}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {car.model || ''} {car.year || ''}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 border font-bold text-blue-600">
                                {car.price} {car.currency || 'KWD'}
                              </td>
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
                                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all"
                                      >
                                        ✅ موافقة
                                      </button>
                                      <button
                                        onClick={() => updateCarStatus(car.id, 'rejected')}
                                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all"
                                      >
                                        ❌ رفض
                                      </button>
                                    </>
                                  )}
                                  {car.status === 'approved' && (
                                    <button
                                      onClick={() => updateCarStatus(car.id, 'sold')}
                                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all"
                                    >
                                      💰 مباع
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteCar(car.id)}
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all"
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
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
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
                            <td colSpan={5} className="text-center p-8 text-gray-400">
                              📭 لا يوجد مستخدمين
                            </td>
                          </tr>
                        ) : (
                          users.map((user: any, i: number) => {
                            const isAdminUser = user.email?.toLowerCase().includes('admin') || user.name?.toLowerCase().includes('admin');
                            return (
                              <tr key={user.id} className="hover:bg-blue-50 transition border-b">
                                <td className="p-3 border text-center">{i + 1}</td>
                                <td className="p-3 border">
                                  <div className="flex items-center gap-2">
                                    <span>{user.name || '—'}</span>
                                    {isAdminUser && (
                                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">مسؤول</span>
                                    )}
                                  </div>
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
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all ${
                                        user.is_active 
                                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' 
                                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                      }`}
                                    >
                                      {user.is_active ? '🔴 تعطيل' : '🟢 تفعيل'}
                                    </button>
                                    {!isAdminUser && (
                                      <button
                                        onClick={() => deleteUser(user.id)}
                                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all"
                                      >
                                        🗑️ حذف
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
                    <div className="border-2 border-blue-100 rounded-xl p-6 bg-blue-50/50">
                      <h3 className="font-bold text-lg text-blue-700 flex items-center gap-2">
                        <span>💳</span> باي بال
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">إعدادات بوابة الدفع</p>
                      <input
                        type="text"
                        placeholder="البريد الإلكتروني لباي بال"
                        className="w-full border border-blue-200 rounded-lg p-3 mt-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        defaultValue="example@paypal.com"
                      />
                      <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg mt-3 hover:shadow-lg transition-all text-sm w-full font-medium">
                        💾 حفظ
                      </button>
                    </div>
                    <div className="border-2 border-purple-100 rounded-xl p-6 bg-purple-50/50">
                      <h3 className="font-bold text-lg text-purple-700 flex items-center gap-2">
                        <span>🏦</span> ويسترن يونيون
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">معلومات التحويل</p>
                      <textarea
                        placeholder="معلومات ويسترن يونيون"
                        className="w-full border border-purple-200 rounded-lg p-3 mt-2 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                        rows={3}
                        defaultValue="الاسم: ...\nرقم الحساب: ..."
                      />
                      <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2.5 rounded-lg mt-3 hover:shadow-lg transition-all text-sm w-full font-medium">
                        💾 حفظ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* تبويب الإعدادات */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ إعدادات الموقع</h2>
                  <div className="max-w-lg bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="mb-4">
                      <label className="block font-bold text-gray-700 text-sm mb-2">📝 اسم الموقع</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        defaultValue="🚗 منصة إعلانات السيارات"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block font-bold text-gray-700 text-sm mb-2">🔧 حالة الصيانة</label>
                      <select className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                        <option value="off">🟢 الموقع يعمل</option>
                        <option value="on">🔴 تحت الصيانة</option>
                      </select>
                    </div>
                    <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition-all text-sm w-full font-medium">
                      💾 حفظ الإعدادات
                    </button>
                  </div>
                </div>
              )}

              {/* تبويب الإعلانات المميزة */}
              {activeTab === 'premium' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ الإعلانات المميزة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50/50">
                      <h3 className="font-bold text-lg text-orange-700 flex items-center gap-2">
                        <span>⭐</span> مميز
                      </h3>
                      <p className="text-sm text-gray-500">طلبات الإعلانات المدفوعة</p>
                      <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-lg mt-4 hover:shadow-lg transition-all text-sm w-full font-medium">
                        📋 عرض الطلبات
                      </button>
                    </div>
                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50/50">
                      <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
                        <span>📋</span> عادي
                      </h3>
                      <p className="text-sm text-gray-500">الإعلانات العادية</p>
                      <button className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2.5 rounded-lg mt-4 hover:shadow-lg transition-all text-sm w-full font-medium">
                        📋 عرض الإعلانات
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
