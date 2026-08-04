'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface Car {
  id: number;
  name: string;
  price: string;
  year: string;
  image?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [user, setUser] = useState<any>(null);
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const fetchProfileData = async () => {
    try {
const userId = localStorage.getItem('userId') || Cookies.get('userId');
      if (!userId) {
        router.push('/login');
        return;
      }

      const [userRes, carsRes] = await Promise.all([
        fetch(`/api/user?id=${userId}`).catch(() => null),
        fetch(`/api/cars?userId=${userId}`).catch(() => null)
      ]);

      const userData = userRes ? await userRes.json().catch(() => null) : null;
      const carsData = carsRes ? await carsRes.json().catch(() => null) : null;

      if (userData && userData.success && userData.user) {
        const rawUser = Array.isArray(userData.user) ? userData.user[0] : userData.user;
        console.log('📧 Raw user data from API:', rawUser);
  console.log('📧 Email field:', rawUser.email);
        
        setUser({
          id: parseInt(rawUser.id, 10) || 0,
          name: String(rawUser.name || rawUser.username || ''),
          email: String(rawUser.email || ''),
          phone: String(rawUser.phone || ''),
          is_premium: Boolean(rawUser.is_premium)
        });
        
        setFormData({
          name: String(rawUser.name || rawUser.username || ''),
          phone: String(rawUser.phone || ''),
          password: ''
        });
      }

      if (carsData) {
        if (Array.isArray(carsData)) {
          setMyCars(carsData);
        } else if (Array.isArray(carsData.cars)) {
          setMyCars(carsData.cars);
        }
      }

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setErr(`خطأ في جلب البيانات: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMsg('');
    setErr('');

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: formData.name,
          phone: formData.phone,
          password: formData.password || undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        setMsg('تم تحديث البيانات بنجاح');
        setUser((prev: any) => ({
          ...prev,
          name: formData.name,
          phone: formData.phone
        }));
      } else {
        setErr(data.message || 'حدث خطأ أثناء التحديث');
      }

    } catch (error: any) {
      console.error('Update error:', error);
      setErr(`خطأ في التحديث: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">لم يتم العثور على المستخدم</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-center">لوحة إدارة الحساب الشخصي</h1>

      {msg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {msg}
        </div>
      )}
      {err && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {err}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">البيانات الأساسية</h2>
        <p className="text-sm text-gray-500 mb-4">* مطلوبة</p>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني (لا يمكن تغييره)
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاسم الكامل *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الهاتف *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة السر الجديدة (اتركها فارغة للإبقاء على الحالية)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {updating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-orange-700 mb-2">باقة الاشتراك المدفوع الفاخرة</h2>
        <p className="text-gray-700 mb-4">
          ارفع مبيعاتك وحول حسابك إلى الفئة التجارية المحترفة واستفد من ميزات الانتشار الكبرى داخل صالة العرض لدينا:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mr-4">
          <li>رفع حصص <strong>8 صور عالية الدقة</strong> لكل إعلان بدلاً من صورتين فقط</li>
          <li><strong>تميز إعلاناتك تلقائياً</strong> وتظهر في الصدارة لجذب المشترين أسرع بـ 5 مرات</li>
          <li><strong>أولوية في المراجعة</strong> لسرعة قبول إعلاناتك من قبل الإدارة</li>
        </ul>
        <div className="mt-4">
          <span className="inline-block bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
            {user.is_premium ? '⭐ مشترك Premium' : '💎 اشترك الآن'}
          </span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">إعلاناتي المعروضة ({myCars.length})</h2>
        </div>

        {myCars.length === 0 ? (
          <p className="text-gray-500 text-center py-8">لا توجد إعلانات حالياً</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCars.map((car) => (
              <div key={car.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                {car.image && (
                  <img src={car.image} alt={car.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{car.name}</h3>
                  <p className="text-gray-600">{car.year}</p>
                  <p className="text-blue-600 font-bold">د. {car.price}</p>
                  <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition w-full">
                    عرض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
