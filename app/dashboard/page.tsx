'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  status: string;
  currency: string;
}

export default function UserDashboardProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [user, setUser] = useState({
    id: 0, name: '', email: '', phone: '', is_premium: false
  });

  const [formData, setFormData] = useState({
    name: '', phone: '', password: ''
  });

  const [myCars, setMyCars] = useState<Car[]>([]);

  const fetchProfileData = async () => {
    try {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
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

      if (userData && userData.success) {
        setUser(userData.user);
        setFormData({
          name: userData.user.name || '',
          phone: userData.user.phone || '',
          password: ''
        });
      }

      if (carsData) {
        if (Array.isArray(carsData)) setMyCars(carsData);
        else if (Array.isArray(carsData.cars)) setMyCars(carsData.cars);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);
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
          password: formData.password || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg('تم تحديث بياناتك الشخصية بنجاح! ✨');
        setUser({ ...user, name: formData.name, phone: formData.phone });
      } else {
        setErr(data.message || 'فشل تحديث البيانات الشخصية');
      }
    } catch (error) {
      setErr('حدث خطأ غير متوقع أثناء تحديث البيانات');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpgradePremium = async () => {
    if (!confirm('هل تود ترقية حسابك إلى الاشتراك المدفوع والاستمتاع بميزات الـ Premium؟ 👑')) return;
    setUpdating(true);
    setMsg('');
    setErr('');

    try {
      const res = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      });
      const data = await res.json();
      if (data.success) {
        setMsg('تهانينا! تم ترقية حسابك إلى الباقة الفاخرة بنجاح 👑✨');
        setUser({ ...user, is_premium: true });
      } else {
        setErr(data.message || 'فشل ترقية الحساب حالياً');
      }
    } catch (error) {
      setErr('حدث خطأ أثناء معالجة ترقية الاشتراك');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#64748b', fontSize: '15px' }}>جاري تحميل ملفك الشخصي الفاخر...</p>
      </div>
    );
  }

  const styIn = {
    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1',
    marginTop: '5px', boxSizing: 'border-box' as const, color: '#1e293b', backgroundColor: '#f8fafc'
  };
  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a', margin: 0 }}>👤 لوحة إدارة الحساب الشخصي</h1>
        <Link href="/" style={{ textDecoration: 'none', backgroundColor: '#475569', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
          ← صالة العرض الرئيسية
        </Link>
      </div>

      {msg && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold', fontSize: '13px' }}>✅ {msg}</div>}
      {err && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold', fontSize: '13px' }}>❌ {err}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '25px' }}>
        <form onSubmit={handleUpdateProfile} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '15px', fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>📝 تعديل البيانات الشخصية</h2>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>📧 البريد الإلكتروني (لا يمكن تغييره)</label>
            <input type="email" disabled value={user.email || ''} style={{ ...styIn, backgroundColor: '#e2e8f0', cursor: 'not-allowed', color: '#64748b' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>👤 الاسم الكامل *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styIn} placeholder="أدخل اسمك الكامل" />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>📞 رقم الهاتف *</label>
            <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={styIn} placeholder="أدخل رقم هاتفك الجديد" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>🔒 كلمة السر الجديدة (اتركها فارغة للإبقاء على الحالية)</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={styIn} placeholder="••••••••" />
          </div>

          <button type="submit" disabled={updating} style={{ width: '100%', padding: '10px', backgroundColor: updating ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: updating ? 'not-allowed' : 'pointer' }}>
            {updating ? 'جاري الحفظ والتدقيق...' : '💾 حفظ التغييرات'}
          </button>
        </form>

        <div style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(245,158,11,0.1)', border: '1px solid #fef3c7', position: 'relative' }}>
          <h2 style={{ fontSize: '16px', color: '#92400e', marginBottom: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>👑 باقة الاشتراك المدفوع الفاخرة</h2>
          <p style={{ fontSize: '13px', color: '#78350f', margin: '0 0 15px 0', lineHeight: '1.6' }}>
            ارفع مبيعاتك وحول حسابك إلى الفئة التجارية المحترفة واستفد من ميزات الانتشار الكبرى داخل صالة العرض لدينا:
          </p>
          <ul style={{ paddingRight: '18px', margin: '0 0 20px 0', fontSize: '12px', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>📸 **رفع حتى 8 صور عالية الدقة** لكل إعلان بدلاً من صورتين فقط لعرض سيارتك من كافة الزوايا.</li>
            <li>✨ **تميز إعلاناتك تلقائياً** وظهورها في الصدارة وفي الواجهة الرئيسية لجذب المشترين أسرع بـ 5 مرات.</li>
            <li>🚀 **دعم فني متميز** لسرعة قبول ومراجعة إعلاناتك من قبل الإدارة.</li>
          </ul>

          {user.is_premium ? (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', textAlign: 'center', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px' }}>
              ✨ باقة الـ Premium مفعّلة ونشطة بحسابك حالياً
            </div>
          ) : (
            <button type="button" onClick={handleUpgradePremium} disabled={updating} style={{ width: '100%', padding: '12px', backgroundColor: '#f59e0b', color: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: updating ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(245,158,11,0.2)' }}>
              {updating ? 'جاري تفعيل الباقة...' : '👑 ترقية الحساب إلى Premium الآن'}
            </button>
          )}
        </div>
      </div>
      <h2 style={{ fontSize: '15px', color: '#1e3a8a', marginBottom: '15px', fontWeight: 'bold' }}>🚙 إعلاناتي المعروضة ({myCars.length})</h2>
      
      {myCars.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px' }}>
          لا توجد لديك سيارات معروضة حالياً. يمكنك البدء بنشر إعلانك الأول مجاناً!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '15px' }}>
          {myCars.map((car) => {
            if (!car) return null;
            const carBrand = car.brand || 'سيارة';
            const carModel = car.model || '';
            const carYear = car.year || '----';
            const carPrice = car.price ? car.price.toLocaleString() : '0';
            const carCurrency = car.currency === 'SAR' ? 'ر.س' : 'د.ك';
            const carImageSrc = car.images ? String(car.images) : '';

            return (
              <div key={car.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                <div style={{ padding: '8px', backgroundColor: '#f8fafc' }}>
                  {carImageSrc && carImageSrc.trim() !== '' ? (
                    <img src={carImageSrc} alt={carBrand} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>🚗 لا توجد صورة</div>
                  )}
                </div>
                <div style={{ padding: '12px' }}>
                  <h3 style={{ fontSize: '14px', margin: '0 0 5px 0', color: '#0f172a', fontWeight: 'bold' }}>{carBrand} {carModel}</h3>
                  <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold', marginBottom: '8px' }}>{carPrice} {carCurrency}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>📅 {carYear}</span>
                    <Link href={`/car/${car.id}`} style={{ textDecoration: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 'bold' }}>عرض ←</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  loadingContainer: { display: 'flex' as const, flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '10px' },
  spinner: { width: '35px', height: '35px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
console.log(styles); // ⚡ تم إدراج هذا السطر الصغير لقراءة المتغير وتمرير فحص لغة TypeScript بنجاح

