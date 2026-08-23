"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Car {
  id: any;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  images: any;
}

export default function DashboardCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<any>(null);

  // تم إدراج رابط قاعدة البيانات والـ Bucket الخاص بك هنا تلقائياً
  const SUPABASE_STORAGE_URL = "https://supabase.co";

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cars');
      if (res.ok) {
        const data = await res.json();
        setCars(data);
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

  // دالة تحديث حالة السيارة
  const handleUpdateStatus = async (id: any, currentStatus: string) => {
    try {
      setActionLoading(id);
      const nextStatus = currentStatus === 'pending' ? 'approved' : currentStatus === 'approved' ? 'sold' : 'approved';

      // محاولة الإرسال للمسار الديناميكي الجديد car/[id] بناءً على تغييرات الملفات في GitHub
      const res = await fetch(`/api/car/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        fetchCars();
      } else {
        // محاولة بديلة إذا كان الـ API القديم api/cars ما زال نشطاً ويستقبل الـ id بالـ body
        const resAlt = await fetch('/api/cars', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: nextStatus })
        });
        if (resAlt.ok) fetchCars();
      }
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // دالة حذف السيارة
  const handleDeleteCar = async (id: any) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      setActionLoading(id);
      
      // إرسال الحذف للمسار الديناميكي الجديد
      const res = await fetch(`/api/car/${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        setCars(cars.filter(car => car.id !== id));
      } else {
        // محاولة بديلة للمسار القديم مع الـ Query parameters
        const resAlt = await fetch(`/api/cars?id=${id}`, { method: 'DELETE' });
        if (resAlt.ok) setCars(cars.filter(car => car.id !== id));
      }
    } catch (error) {
      console.error('خطأ في حذف السيارة:', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>🚗 إدارة إعلانات السيارات</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>إجمالي السيارات المتاحة: <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{cars.length}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/dashboard" style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>⬅️ العودة للرئيسية</Link>
          <Link href="/dashboard/cars/new" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>➕ إضافة سيارة</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>جاري تحميل السيارات وتحديث الأرقام...</div>
      ) : cars.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>📭 لا توجد إعلانات سيارات منشورة حالياً في قاعدة البيانات.</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 15px', color: '#475569' }}>الصورة</th>
                <th style={{ padding: '12px 15px', color: '#475569' }}>السيارة</th>
                <th style={{ padding: '12px 15px', color: '#475569' }}>الموديل</th>
                <th style={{ padding: '12px 15px', color: '#475569' }}>السعر</th>
                <th style={{ padding: '12px 15px', color: '#475569' }}>الحالة</th>
                <th style={{ padding: '12px 15px', color: '#475569', textAlign: 'center' }}>التحكم</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                let thumb = "";
                const imgData = car.images;

                // فحص وتركيب روابط الصور لتعمل مع Supabase Storage المباشر
                if (Array.isArray(imgData) && imgData.length > 0) {
                  thumb = imgData[0].startsWith('http') ? imgData[0] : `${SUPABASE_STORAGE_URL}${imgData[0]}`;
                } else if (typeof imgData === 'string') {
                  thumb = imgData.startsWith('http') ? imgData : `${SUPABASE_STORAGE_URL}${imgData}`;
                }

                return (
                  <tr key={car.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px 15px' }}>
                      <img src={thumb || "/car-placeholder.png"} alt="car" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
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
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
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
