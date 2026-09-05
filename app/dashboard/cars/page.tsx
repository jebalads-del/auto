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
  is_featured?: boolean;
  featured_status?: string | null;
}

export default function DashboardCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // حالات التحكم في منبثقة الدفع والتمييز
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cars');
      if (res.ok) {
        const data = await res.json();
        let carsList: Car[] = [];
        if (data.success && Array.isArray(data.cars)) {
          carsList = data.cars;
        } else if (Array.isArray(data)) {
          carsList = data;
        }
        setCars(carsList);
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

  // دالة إرسال طلب تمييز الإعلان بعد مراجعة طرق الدفع
  const handleRequestFeature = async () => {
    if (!selectedCarId) return;
    try {
      setActionLoading(selectedCarId);
      setShowPaymentModal(false);

      const res = await fetch(`/api/cars/${selectedCarId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured_status: 'pending' })
      });

      if (res.ok) {
        alert('⭐ تم إرسال طلب تمييز الإعلان بنجاح! سيقوم المشرف بتفعيل الإعلان فور التأكد من الدفع.');
        await fetchCars();
      } else {
        alert('❌ فشل إرسال الطلب، يرجى المحاولة لاحقاً');
      }
    } catch (error) {
      console.error('❌ خطأ في طلب التميز:', error);
    } finally {
      setActionLoading(null);
      setSelectedCarId(null);
    }
  };

  const handleDeleteCar = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCars(prev => prev.filter(car => car.id !== id));
        alert('✅ تم حذف الإعلان بنجاح');
      }
    } catch (error) {
      console.error('❌ خطأ في الحذف:', error);
    } finally {
      setActionLoading(null);
    }
  };
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
      return imagesArray.length > 0 ? imagesArray[0] : '/car-placeholder.png';
    } catch {
      return '/car-placeholder.png';
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; bg: string; color: string }> = {
      'pending': { label: 'قيد الانتظار', bg: '#fef9c3', color: '#a16207' },
      'approved': { label: 'مقبول', bg: '#dcfce7', color: '#15803d' },
      'sold': { label: 'مباع', bg: '#fee2e2', color: '#991b1b' }
    };
    return statusMap[status] || { label: status, bg: '#f1f5f9', color: '#64748b' };
  };

  if (loading) return <div style={{ direction: 'rtl', padding: '20px', textAlign: 'center', paddingTop: '50px' }}><p>جاري تحميل السيارات...</p></div>;

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>🚗 إدارة إعلانات السيارات</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>إجمالي السيارات المتاحة: <b>{cars.length}</b></p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/dashboard" style={{ backgroundColor: '#6b7280', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>⬅️ الرئيسية</Link>
          <Link href="/dashboard/cars/new" style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>➕ إضافة سيارة</Link>
        </div>
      </div>

      {cars.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>📭 لا توجد إعلانات سيارات منشورة حالياً.</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>الصورة</th>
                <th style={{ padding: '12px' }}>السيارة</th>
                <th style={{ padding: '12px' }}>الموديل</th>
                <th style={{ padding: '12px' }}>السعر</th>
                <th style={{ padding: '12px' }}>الحالة</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>التميز المدفوع</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>التحكم</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                const statusInfo = getStatusDisplay(car.status);
                return (
                  <tr key={car.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '12px' }}><img src={getCarImage(car)} alt={car.brand} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} /></td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{car.brand} {car.model}</td>
                    <td style={{ padding: '12px' }}>{car.year}</td>
                    <td style={{ padding: '12px', color: '#059669', fontWeight: 'bold' }}>{car.price} KWD</td>
                    <td style={{ padding: '12px' }}><span style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{statusInfo.label}</span></td>
                    
                    {/* زر طلب التميز الذهبي الذكي */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {car.is_featured ? (
                        <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #f59e0b' }}>🌟 مميز نشط</span>
                      ) : car.featured_status === 'pending' ? (
                        <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>⏳ قيد المراجعة الماليّة</span>
                      ) : (
                        <button onClick={() => { setSelectedCarId(car.id); setShowPaymentModal(true); }} style={{ padding: '6px 12px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>⭐ طلب ترقية لمميز</button>
                      )}
                    </td>

                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button onClick={() => handleDeleteCar(car.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>حذف</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* منبثقة تفاصيل الدفع للترقية */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '450px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>⭐ ترقية الإعلان إلى مميز (مدفوع)</h2>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>تمنحك الترقية ظهور إعلانك في أعلى الصفحة الرئيسية دائماً لجذب انتباه المشترين فوراً.</p>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 6px 0' }}>💰 طرق الدفع المتوفرة:</p>
              <p style={{ margin: '3px 0' }}>• <b>Western Union:</b> الاسم الكامل: مدير الموقع - الدولة: الكويت</p>
              <p style={{ margin: '3px 0' }}>• <b>PayPal:</b> admin@sayarty.store</p>
              <p style={{ margin: '8px 0 0 0', color: '#2563eb', fontWeight: 'bold' }}>* يرجى تحويل الرسوم ثم الضغط على تأكيد الإرسال.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowPaymentModal(false); setSelectedCarId(null); }} style={{ padding: '8px 14px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>إلغاء</button>
              <button onClick={handleRequestFeature} style={{ padding: '8px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✅ تم الدفع، إرسال الطلب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
