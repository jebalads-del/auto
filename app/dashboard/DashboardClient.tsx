'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Car {
  id: number;
  brand: string;
  model: string;
  price: number;
  year: number;
  kilometers: number;
  color: string;
  description: string;
  images: string | string[];
  status: string;
  is_featured?: boolean;
  currency: string;
  created_at: string;
}

export default function DashboardClient() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        console.log('📊 جلب السيارات من API...');
        const res = await fetch('/api/cars');
        const data = await res.json();
        console.log('📊 البيانات المستلمة:', data);
        
        if (data.success && data.cars) {
          setCars(data.cars);
          console.log(`✅ تم جلب ${data.cars.length} سيارة`);
        } else {
          setError('فشل في جلب البيانات');
          console.error('❌ فشل جلب البيانات:', data);
        }
      } catch (err) {
        console.error('❌ خطأ في الاتصال:', err);
        setError('خطأ في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const updateCarStatus = async (id: number, status: string) => {
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
    if (typeof images === 'string') {
      if (images.startsWith('http')) return images;
      return '/images/default-car.jpg';
    }
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      if (first && first.startsWith('http')) return first;
      return '/images/default-car.jpg';
    }
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{cars.length}</div>
            <div className="text-gray-600">🚗 إجمالي السيارات</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {cars.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-gray-600">⏳ قيد المراجعة</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {cars.filter(c => c.status === 'approved').length}
            </div>
            <div className="text-gray-600">✅ موافق عليها</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>
          )}

          <h2 className="text-xl font-bold mb-4">🚗 إدارة السيارات</h2>

          {cars.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              📭 لا توجد سيارات
              <div className="mt-4">
                <button
                  onClick={() => router.push('/dashboard/cars/new')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-bold"
                >
                  ➕ نشر أول إعلان
                </button>
              </div>
            </div>
          ) : (
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
                  {cars.map((car, i) => {
                    const imageUrl = getImageUrl(car.images);
                    return (
                      <tr key={car.id} className="hover:bg-gray-50 transition">
                        <td className="p-2 border text-center">{i + 1}</td>
                        <td className="p-2 border">
                          <img
                            src={imageUrl}
                            alt={car.brand}
                            className="w-12 h-12 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/default-car.jpg';
                            }}
                          />
                        </td>
                        <td className="p-2 border">{car.brand} {car.model}</td>
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
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
