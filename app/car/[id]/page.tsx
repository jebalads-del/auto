'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CarDetailPage() {
  const params = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    const fetchCarDetail = async () => {
      try {
        const res = await fetch(`/api/cars?t=${Date.now()}`);
        const data = await res.json();
        if (data.success && data.cars) {
          // مطابقة دقيقة وصارمة للمعرّف رقمياً أو نصياً لتفادي مشكلة الحذف
          const currentCar = data.cars.find((c: any) => String(c.id) === String(params.id));
          if (currentCar) setCar(currentCar);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetail();
  }, [params?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#64748b' }}>⏳ جاري جلب مواصفات السيارة والصور الحية...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif', direction: 'rtl' }}>
        <h2 style={{ color: '#ef4444' }}>❌ عذراً، الإعلان غير موجود أو تم حذفه!</h2>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>العودة للمعرض الرئيسي ←</Link>
      </div>
    );
  }

  const validImageSrc = car.images ? String(car.images).trim() : '';

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: '15px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>← العودة لمعرض السيارات</Link>
        <h1 style={{ fontSize: '22px', margin: '0 0 15px 0', color: '#0f172a' }}>{car.brand} {car.model}</h1>
        
        <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          {validImageSrc && validImageSrc.startsWith('http') ? (
            <img src={validImageSrc} alt={car.brand} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
          ) : (
            <div style={{ padding: '60px', color: '#94a3b8', fontSize: '14px' }}>🚗 لا توجد صورة متوفرة لهذا الإعلان</div>
          )}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', margin: '0 0 20px 0' }}>{Number(car.price).toLocaleString()} {car.currency || 'د.ك'}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>📅 سنة الصنع: <strong>{car.year || '---'}</strong></p>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>🛣️ الممشى: <strong>{car.kilometers ? car.kilometers.toLocaleString() + ' كم' : '0 كم'}</strong></p>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>🎨 اللون الخارجي: <strong>{car.color || '---'}</strong></p>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <h3 style={{ fontSize: '15px', margin: '0 0 10px 0', color: '#1e293b' }}>📝 تفاصيل الإعلان:</h3>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{car.description || 'لا يوجد وصف إضافي مضاف.'}</p>
        </div>
      </div>
    </div>
  );
}
