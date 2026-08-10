"use client";
import React, { useEffect, useState } from 'react';

export default function AdminPage() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/cars');
      const data = await res.json();
      if (data.success) setCars(data.cars || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleCarAction = async (carId: number, action: 'approve' | 'reject' | 'sold' | 'delete') => {
    if (!confirm(`هل أنت متأكد من تنفيذ إجراء الإعلان؟`)) return;
    
    try {
      const res = await fetch('/api/admin/cars/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'تم الإجراء بنجاح');
        fetchCars();
      } else {
        alert('فشل في تنفيذ الإجراء: ' + data.message);
      }
    } catch (err) {
      alert('حدث خطأ في السيرفر');
    }
  };

  if (loading) return <p style={{padding: '20px', textAlign: 'center'}}>جاري التحميل...</p>;

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2>إعلانات السيارات بانتظار المراجعة</h2>
      <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
        {cars.filter((c: any) => c.status === 'pending' || c.status === 'approved').map((car: any) => (
          <div key={car.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h4>{car.title || 'بدون عنوان'}</h4>
            <p>السعر: {car.price} KWD</p>
            <p>الحالة الحالية: <span style={{color: car.status === 'approved' ? 'green' : 'orange'}}>{car.status}</span></p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => handleCarAction(car.id, 'approve')} style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>🟢 موافقة</button>
              <button onClick={() => handleCarAction(car.id, 'delete')} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
