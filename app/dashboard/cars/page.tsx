'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
      console.error('خطأ في جلب بيانات السيارات من السيرفر');
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
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🚗 إدارة إعلانات السيارات الحية</h1>
        <Link href="/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>← العودة للرئيسية</Link>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>⏳ جاري تحديث السجلات ومزامنة الحالات الفورية...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cars.map((car) => (
            <div key={car.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#0f172a' }}>{car.brand} - {car.model} ({car.year})</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                  💵 السعر: <span style={{ color: '#059669', fontWeight: 'bold' }}>{car.price} د.ك</span> | 
                  الحالة: {car.status === 'sold' ? '🟢 مباعة علناً' : '🔴 معروضة'} | 
                  التميز: {car.is_featured ? '👑 مميز بالأعلى' : 'عادي'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* 1. زر التميز والإلغاء */}
                <button onClick={() => handleAction(car.id, 'feature', !car.is_featured)} style={{ padding: '8px 14px', backgroundColor: car.is_featured ? '#64748b' : '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  {car.is_featured ? '❌ إلغاء التميز' : '👑 تمييز (استلمت 10 د.ك)'}
                </button>
                
                {/* 2. زر مباعة مفتوح دائماً لجميع السيارات بناءً على طلبك */}
                <button onClick={() => handleAction(car.id, 'sold')} style={{ padding: '8px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  🟢 سجلها كمباعة
                </button>

                {/* 3. زر الحذف */}
                <button onClick={() => { if(confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) handleAction(car.id, 'deleted'); }} style={{ padding: '8px 14px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
          {cars.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#fff', borderRadius: '12px' }}>لا توجد إعلانات سيارات مضافة حالياً في النظام.</p>
          )}
        </div>
      )}
    </div>
  );
}
