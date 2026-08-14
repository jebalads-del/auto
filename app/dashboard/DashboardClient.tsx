'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Car {
  id: number;
  title: string;
  brand: string;
  model: string;
  price: number;
  year: number;
  kilometers: number;
  color: string;
  description: string;
  images: string | string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  is_featured?: boolean;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

export default function DashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cars' | 'users' | 'stats'>('cars');
  const [cars, setCars] = useState<Car[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, usersRes] = await Promise.all([
          fetch('/api/cars'),
          fetch('/api/users')
        ]);

        const carsData = await carsRes.json();
        const usersData = await usersRes.json();

        if (carsData.success) setCars(carsData.cars || []);
        if (usersData.success) setUsers(usersData.users || []);
      } catch (err) {
        setError('فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateCarStatus = async (id: number, status: Car['status']) => {
    try {
      const res = await fetch('/api/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setCars(prev =>
          prev.map(car =>
            car.id === id ? { ...car, status } : car
          )
        );
      }
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
    }
  };

  const getImageUrl = (images: string | string[] | undefined): string => {
    if (!images) return '/images/default-car.jpg';
    if (typeof images === 'string') return images;
    if (Array.isArray(images) && images.length > 0) return images[0];
    return '/images/default-car.jpg';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 rtl" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📊 لوحة التحكم</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dashboard/cars/new')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-bold"
            >
              ➕ نشر إعلان جديد
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
            >
              ← العودة للموقع
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setActiveTab('cars')}
            className={`p-4 rounded-xl shadow-md transition-all ${activeTab === 'cars'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105'
                : 'bg-white hover:shadow-lg'
              }`}
          >
            <div className="text-2xl">🚗</div>
            <div className="font-bold">السيارات ({cars.length})</div>
            <div className="text-sm opacity-75">إدارة</div>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`p-4 rounded-xl shadow-md transition-all ${activeTab === 'users'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105'
                : 'bg-white hover:shadow-lg'
              }`}
          >
            <div className="text-2xl">👥</div>
            <div className="font-bold">المستخدمين ({users.length})</div>
            <div className="text-sm opacity-75">إدارة</div>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`p-4 rounded-xl shadow-md transition-all ${activeTab === 'stats'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105'
                : 'bg-white hover:shadow-lg'
              }`}
          >
            <div className="text-2xl">⭐</div>
            <div className="font-bold">إعلانات مميزة</div>
            <div className="text-sm opacity-75">(مدفوعة)</div>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
          )}

          {activeTab === 'cars' && (
            <div>
              <h2 className="text-xl font-bold mb-4">🚗 إدارة السيارات</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border text-right">#</th>
                      <th className="p-2 border text-right">الصورة</th>
                      <th className="p-2 border text-right">السيارة</th>
                      <th className="p-2 border text-right">السعر</th>
                      <th className="p-2 border text-right">الحالة</th>
                      <th className="p-2 border text-right">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-400">
                          📭 لا توجد سيارات
                        </td>
                      </tr>
                    ) : (
                      cars.map((car, i) => {
                        const imageUrl = getImageUrl(car.images);
                        return (
                          <tr key={car.id} className="hover:bg-gray-50 transition">
                            <td className="p-2 border text-center">{i + 1}</td>
                            <td className="p-2 border">
                              <img
                                src={imageUrl}
                                alt={car.title}
                                className="w-12 h-12 object-cover rounded border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/default-car.jpg';
                                }}
                              />
                            </td>
                            <td className="p-2 border">{car.title || car.brand}</td>
                            <td className="p-2 border">{car.price} د.ك</td>
                            <td className="p-2 border">
                              <span className={`px-2 py-1 rounded text-sm ${
                                car.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : car.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {car.status === 'approved' ? '✅ موافق' :
                                 car.status === 'pending' ? '⏳ قيد المراجعة' :
                                 car.status === 'sold' ? '💰 مباع' :
                                 '❌ مرفوض'}
                              </span>
                            </td>
                            <td className="p-2 border">
                              <div className="flex gap-2 flex-wrap">
                                {car.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateCarStatus(car.id, 'approved')}
                                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                                    >
                                      موافقة
                                    </button>
                                    <button
                                      onClick={() => updateCarStatus(car.id, 'rejected')}
                                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                                    >
                                      رفض
                                    </button>
                                  </>
                                )}
                                {car.status === 'approved' && (
                                  <button
                                    onClick={() => updateCarStatus(car.id, 'sold')}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                                  >
                                    ✅ مباع
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
                      users.map((user, i) => (
                        <tr key={user.id} className="hover:bg-blue-50 transition border-b">
                          <td className="p-3 border text-center">{i + 1}</td>
                          <td className="p-3 border">{user.name || '—'}</td>
                          <td className="p-3 border">{user.email || '—'}</td>
                          <td className="p-3 border">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.is_active ? '🟢 نشط' : '🔴 غير نشط'}
                            </span>
                          </td>
                          <td className="p-3 border">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/users', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: user.id, is_active: !user.is_active }),
                                  });
                                  if (res.ok) {
                                    setUsers(prev =>
                                      prev.map(u =>
                                        u.id === user.id ? { ...u, is_active: !u.is_active } : u
                                      )
                                    );
                                  }
                                } catch (error) {
                                  console.error('خطأ:', error);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition-all ${
                                user.is_active
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                              }`}
                            >
                              {user.is_active ? 'تعطيل' : 'تفعيل'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-bold mb-4">⭐ الإعلانات المميزة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cars.filter(car => car.is_featured).length === 0 ? (
                  <p className="text-gray-400 col-span-2">لا توجد إعلانات مميزة</p>
                ) : (
                  cars.filter(car => car.is_featured).map(car => (
                    <div key={car.id} className="border rounded-lg p-4 flex items-center gap-4">
                      <img
                        src={getImageUrl(car.images)}
                        alt={car.title}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/default-car.jpg';
                        }}
                      />
                      <div>
                        <h3 className="font-bold">{car.title}</h3>
                        <p className="text-sm text-gray-600">{car.price} د.ك</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
