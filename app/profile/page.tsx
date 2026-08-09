'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  images: any;
  is_featured: boolean;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('مستخدم');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setEmail('mara7b@gmail.com');
        setName('مراحب');
        setPhone('85274158');
        
        const res = await fetch(`/api/user/cars?t=${Date.now()}`).catch(() => null);
        const data = res ? await res.json().catch(() => null) : null;
        if (data && data.success) {
          setCars(data.cars || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleFeatureRequest = async (carId: number) => {
    if (!confirm('هل تود إرسال طلب للإدارة لتثبيت هذا الإعلان كإعلان مميز في الصدارة؟')) return;
    try {
      const res = await fetch('/api/user/cars/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ تم إرسال طلب تمييز الإعلان بنجاح، جاري مراجعته من الإدارة.');
      } else {
        alert('❌ فشل إرسال الطلب، حاول مجدداً.');
      }
    } catch {
      alert('⚠️ خطأ في الاتصال بالسيرفر أثناء طلب التمييز');
    }
  };
  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* هيدر اللوحة مع أزرار التنقل وزر نشر إعلان جديد الفوري */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>👤 لوحة إدارة الحساب الشخصي</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* تم تعديل مسار نشر إعلان جديد ليوجه للوحة الإضافة مباشرة */}
          <Link href="/dashboard/cars/new" style={{ backgroundColor: '#f59e0b', color: '#1e293b', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' }}>
            ➕ نشر إعلان جديد
          </Link>
          <Link href="/" style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px' }}>
            🏠 صالة العرض الرئيسية
          </Link>
        </div>
      </div>

      {/* نموذج تعديل البيانات الشخصية */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#475569' }}>📝 تعديل البيانات الشخصية</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px' }}>📧 البريد الإلكتروني (لا يمكن تغييره)</label>
            <input type="text" value={email} disabled style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px' }}>👤 الاسم الكامل *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px' }}>📞 رقم الهاتف *</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '5px' }}>💾 حفظ التغييرات</button>
        </div>
      </div>
      {/* قسم الإعلانات الخاصة بالعميل مع زر طلب التمييز */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#475569' }}>🚘 إعلاناتي المعروضة ({cars.length})</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '15px' }}>
          {cars.map((car) => {
            let imgUrl = car.images ? String(car.images).replace(/[\{\}\"\'\s]/g, '').split(',') : '';
            return (
              <div key={car.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
                <div style={{ height: '140px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imgUrl && imgUrl !== '' ? <img src={imgUrl} alt={car.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#94a3b8', fontSize: '12px' }}>🚗 لا توجد صورة</span>}
                </div>
                <div style={{ padding: '12px' }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{car.brand} {car.model}</h4>
                  <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>{car.price.toLocaleString()} د.ك</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link href={`/car/${car.id}`} style={{ display: 'block', textAlign: 'center', backgroundColor: '#f1f5f9', color: '#475569', padding: '6px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px' }}>عرض الإعلان ←</Link>
                    {!car.is_featured ? (
                      <button onClick={() => handleFeatureRequest(car.id)} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '7px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>⭐ طلب عمل إعلان مميز</button>
                    ) : (
                      <span style={{ display: 'block', textAlign: 'center', backgroundColor: '#d1fae5', color: '#065f46', padding: '5px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>🌟 إعلان مميز نشط</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {cars.length === 0 && <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', gridColumn: '1/-1' }}>لا توجد إعلانات منشورة باسمك حالياً.</p>}
        </div>
      </div>

    </div>
  );
}
