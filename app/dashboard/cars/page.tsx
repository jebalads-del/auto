"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  images: string | string[] | null;
}

export default function DashboardCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cars');
      if (res.ok) {
        const data = await res.json();
        console.log('📦 [CARS DATA]:', data);
        
        // معالجة البيانات بشكل صحيح
        let carsList: Car[] = [];
        if (data.success && Array.isArray(data.cars)) {
          carsList = data.cars;
        } else if (Array.isArray(data)) {
          carsList = data;
        }
        setCars(carsList);
      } else {
        console.error('❌ فشل في جلب السيارات');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب السيارات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // دالة تحديث حالة السيارة
  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    try {
      setActionLoading(id);
      let nextStatus = 'pending';
      if (currentStatus === 'pending') nextStatus = 'approved';
      else if (currentStatus === 'approved') nextStatus = 'sold';
      else nextStatus = 'pending';

      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ تم تحديث الحالة:', data);
        await fetchCars();
        const statusMap: Record<string, string> = {
          'pending': 'قيد الانتظار',
          'approved': 'مقبول',
          'sold': 'مباع'
        };
        alert(`✅ تم تغيير الحالة إلى ${statusMap[nextStatus] || nextStatus}`);
      } else {
        const data = await res.json();
        console.error('❌ فشل تحديث الحالة:', data);
        alert('❌ فشل تحديث الحالة: ' + (data.message || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث الحالة:', error);
      alert('❌ حدث خطأ في الاتصال بالخادم');
    } finally {
      setActionLoading(null);
    }
  };

  // دالة حذف السيارة
  const handleDeleteCar = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      setActionLoading(id);

      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });

      if (res.ok) {
        setCars(prev => prev.filter(car => car.id !== id));
        alert('✅ تم حذف الإعلان بنجاح');
      } else {
        const data = await res.json();
        console.error('❌ فشل الحذف:', data);
        alert('❌ فشل الحذف: ' + (data.message || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('❌ خطأ في حذف السيارة:', error);
      alert('❌ حدث خطأ في الاتصال بالخادم');
    } finally {
      setActionLoading(null);
    }
  };

  // دالة معالجة الصور
  const getCarImage = (car: Car): string => {
    try {
      if (!car.images) return '/car-placeholder.png';
      
      let imagesArray: string[] = [];
      if (typeof car.images === 'string') {
        const cleanImgs = car.images.trim();
        if (cleanImgs.startsWith('[') && cleanImgs.endsWith(']')) {
          imagesArray = JSON.parse(cleanImgs);
        } else if (cleanImgs.startsWith('http')) {
          return cleanImgs;
        } else {
          imagesArray = cleanImgs.split(',').map((url: string) => url.trim()).filter(Boolean);
        }
      } else if (Array.isArray(car.images)) {
        imagesArray = car.images;
      }
      
      return (imagesArray.length > 0 && imagesArray[0]) ? imagesArray[0] : '/car-placeholder.png';
    } catch (e) {
      console.error('Image parsing error:', e);
      return '/car-placeholder.png';
    }
  };

  // دالة عرض حالة السيارة
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; bg: string; color: string }> = {
      'pending': { label: 'قيد الانتظار', bg: '#fef9c3', color: '#a16207' },
      'approved': { label: 'مقبول', bg: '#dcfce7', color: '#15803d' },
      'sold': { label: 'مباع', bg: '#fee2e2', color: '#991b1b' }
    };
    const s = statusMap[status] || { label: status, bg: '#f1f5f9', color: '#64748b' };
    return s;
  };

  if (loading) {
    return (
      <div style={{ direction: 'rtl', padding: '20px', textAlign: 'center', paddingTop: '50px' }}>
        <p>جاري تحميل السيارات...</p>
      </div>
    );
  }

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

      {cars.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          📭 لا توجد إعلانات سيارات منشورة حالياً في قاعدة البيانات.
        </div>
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
                const carImage = getCarImage(car);
                const statusInfo = getStatusDisplay(car.status);
                return (
                  <tr key={car.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px 15px' }}>
                      <img 
                        src={carImage} 
                        alt={car.brand} 
                        style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/car-placeholder.png'; }}
                      />
                    </td>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{car.brand} {car.model}</td>
                    <td style={{ padding: '12px 15px' }}>{car.year}</td>
                    <td style={{ padding: '12px 15px', color: '#059669', fontWeight: 'bold' }}>{car.price} $</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button 
                          disabled={actionLoading === car.id} 
                          onClick={() => handleUpdateStatus(car.id, car.status)} 
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#f1f5f9', 
                            border: '1px solid #cbd5e1', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '12px',
                            opacity: actionLoading === car.id ? 0.5 : 1
                          }}
                        >
                          {actionLoading === car.id ? '⏳ جاري...' : '🔄 تغيير الحالة'}
                        </button>
                        <button 
                          disabled={actionLoading === car.id} 
                          onClick={() => handleDeleteCar(car.id)} 
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#fee2e2', 
                            color: '#991b1b', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            opacity: actionLoading === car.id ? 0.5 : 1
                          }}
                        >
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
