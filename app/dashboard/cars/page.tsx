'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  is_featured: boolean;
  user_name: string;
}

export default function CarsManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch(`/api/cars?t=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.success) setCars(data.cars || []);
    } catch {
      console.error('خطأ اتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: string, value?: any) => {
    try {
      setLoading(true);
      const payload = action === 'feature' ? { id, is_featured: value } : { id, status: action };
      
      const response = await fetch('/api/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        fetchCars();
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>🚗 إدارة إعلانات السيارات الحية</h1>
      {loading ? <p>جاري تحديث السجلات...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cars.map((car) => (
            <div key={car.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{car.brand} - {car.model} ({car.year})</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>💵 السعر: {car.price} د.ك | 🛡️ التميز: {car.is_featured ? '👑 مميز حالياً' : 'عادي'}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => handleAction(car.id, car.is_featured ? 'feature' : 'feature', !car.is_featured)} style={{ padding: '6px 12px', backgroundColor: car.is_featured ? '#64748b' : '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  {car.is_featured ? '❌ إلغاء التميز' : '👑 تمييز (استلمت 10 د.ك)'}
                </button>
                {car.status !== 'sold' && (
                  <button onClick={() => handleAction(car.id, 'sold')} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                    🟢 سجلها كمباعة
                  </button>
                )}
                <button onClick={() => handleAction(car.id, 'deleted')} style={{ padding: '6px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
