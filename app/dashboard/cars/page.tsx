'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  kilometers: number;
  color: string;
  description: string;
  images: any; 
  status: string;
  currency: string;
}

export default function CarsManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch(`/api/admin/cars?t=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.success) {
        setCars(data.cars || []);
      } else {
        setError('فشل في جلب الإعلانات من قاعدة البيانات');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const handleCarAction = async (carId: number, action: string) => {
    if (action === 'delete' && !confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, action }),
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(data.message || 'تم تحديث حالة الإعلان بنجاح');
        setTimeout(() => fetchCars(), 500);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'فشل السيرفر في معالجة طلب الإعلان');
        setLoading(false);
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      setError('حدث خطأ غير متوقع أثناء الاتصال بـ API الإعلانات');
      setLoading(false);
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#1e293b' }}>🚗 إدارة إعلانات السيارات</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>❌ {error}</div>}
      {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>✅ {success}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>جاري جلب إعلانات السيارات وتحديث الحالة...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cars.map((car) => {
            // كود ذكي لتنظيف رابط الصورة النصي من أي حواصر متبقية
            let carImageSrc = car.images ? String(car.images).replace(/[\{\}\"\'\s]/g, '').split(',')[0] : '';

            return (
              <div key={car.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {carImageSrc && carImageSrc.trim() !== '' ? (
                  <img src={carImageSrc} alt={car.brand} style={{ width: '150px', height: '110px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#e2e8f0' }} />
                ) : (
                  <div style={{ width: '150px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#94a3b8', fontSize: '12px' }}>🚗 لا توجد صورة</div>
                )}
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{car.brand} - {car.model} ({car.year})</h3>
                  <p style={{ margin: '5px 0', color: '#475569', fontSize: '14px' }}>💵 السعر: <strong style={{ color: '#059669' }}>{car.price} {car.currency || 'د.أ'}</strong> | 🛣️ المسافة: {car.kilometers} كم</p>
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ backgroundColor: car.status === 'approved' ? '#d1fae5' : car.status === 'pending' ? '#fef3c7' : '#fee2e2', color: car.status === 'approved' ? '#065f46' : car.status === 'pending' ? '#92400e' : '#991b1b', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {car.status === 'approved' ? '🟢 معتمد ومنشور' : car.status === 'pending' ? '🟡 في انتظار الموافقة' : '🔴 مرفوض'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                  {car.status !== 'approved' && (
                    <button onClick={() => handleCarAction(car.id, 'approve')} style={{ padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                      👍 موافقة ونشر الإعلان
                  </button>
                  )}
                  {car.status === 'pending' && (
                    <button onClick={() => handleCarAction(car.id, 'reject')} style={{ padding: '8px 16px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                      👎 رفض الإعلان
                    </button>
                  )}
                  <button onClick={() => handleCarAction(car.id, 'delete')} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                    🗑️ حذف نهائي
                  </button>
                </div>
              </div>
            );
          })}
          {cars.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#fff', borderRadius: '12px' }}>لا توجد إعلانات سيارات مضافة حالياً.</p>
          )}
        </div>
      )}
    </div>
  );
}
// force rebuild update
