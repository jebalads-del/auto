'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  images: any;
  kilometers?: number;
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // دالة جلب السيارات من الـ API وتأمين قراءتها
  const fetchCars = async () => {
    try {
      setLoading(true);
      // تجربة جلب البيانات من مسار الأدمن، وإذا فشل يتوجه للمسار العام تلقائياً
      let res = await fetch('/api/admin/cars');
      if (!res.ok) res = await fetch('/api/cars');
      
      const data = await res.json();
      
      // التعامل المرن مع كافة أشكال الردود المتوقعة من الـ API (سواء مصفوفة أو كائن)
      if (Array.isArray(data)) {
        setCars(data);
      } else if (data && Array.isArray(data.cars)) {
        setCars(data.cars);
      } else if (data && data.success && Array.isArray(data.data)) {
        setCars(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب السيارات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);
  // دالة تحديث حالة السيارة (قبول، رفض، مباعة)
  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    try {
      setActionLoading(id);
      const nextStatus = currentStatus === 'pending' ? 'approved' : currentStatus === 'approved' ? 'sold' : 'approved';
      
      const res = await fetch('/api/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus })
      });

      if (res.ok) {
        fetchCars(); // إعادة تحديث القائمة فوراً
      }
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // dالة حذف السيارة نهائياً
  const handleDeleteCar = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/cars?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCars(cars.filter(car => car.id !== id));
      }
    } catch (error) {
      console.error('خطأ في حذف السيارة:', error);
    } finally {
      setActionLoading(null);
    }
  };
  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* الهيدر وأزرار العودة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>🚗 إدارة إعلانات السيارات</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>إجمالي السيارات المتاحة: <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{cars.length}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/dashboard" style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
            ⬅️ العودة للرئيسية
          </Link>
          <Link href="/dashboard/cars/new" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
            ➕ إضافة سيارة
          </Link>
        </div>
      </div>

      {/* لوحة العرض وحالة التحميل */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>جاري تحميل السيارات وتحديث الأرقام...</div>
      ) : cars.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlignment: 'center', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          📭 لا توجد إعلانات سيارات منشورة حالياً في قاعدة البيانات.
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlignment: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 15px', color: '#475569' }}>الصورة</th>
                <th style={{ padding: '12px 15px', color: '#475569' }}>السيارة</th>
                <th style={{ padding: '12px 15px', color: '#475569' }}>الموديل</th>
                <th style={{ padding: '12px 15px', color: '#475569' }}>السعر</th>
                <th style={{ padding: '12px 15px', color: '#475569' }}>الحالة</th>
                <th style={{ padding: '12px 15px', color: '#475569', textAlignment: 'center' }}>التحكم</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                // استخراج الرابط الأول للصور بأمان
                let thumb = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>';
                if (Array.isArray(car.images) && car.images.length > 0) thumb = car.images[0];
                else if (typeof car.images === 'string' && car.images.startsWith('http')) thumb = car.images;

                return (
                  <tr key={car.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px 15px' }}>
                      <img src={thumb} alt="car" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                    </td>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{car.brand} {car.model}</td>
                    <td style={{ padding: '12px 15px' }}>{car.year}</td>
                    <td style={{ padding: '12px 15px', color: '#059669', fontWeight: 'bold' }}>{car.price} $</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: car.status === 'approved' ? '#dcfce7' : car.status === 'sold' ? '#fee2e2' : '#fef9c3',
                        color: car.status === 'approved' ? '#15803d' : car.status === 'sold' ? '#991b1b' : '#a16207'
                      }}>
                        {car.status === 'approved' ? 'مقبول' : car.status === 'sold' ? 'مباع' : 'قيد الانتظار'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', textAlignment: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button disabled={actionLoading === car.id} onClick={() => handleUpdateStatus(car.id, car.status)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                          🔄 تغيير الحالة
                        </button>
                        <button disabled={actionLoading === car.id} onClick={() => handleDeleteCar(car.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                          🗑️ حذف
                        </button>
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
  );
}

