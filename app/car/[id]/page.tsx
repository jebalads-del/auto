'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CarDetailPage() {
  const params = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params?.id) return;

    const fetchCarDetail = async () => {
      setLoading(true);
      setError('');
      
      try {
        // جلب السيارة مباشرة باستخدام ID
        const res = await fetch(`/api/cars/${params.id}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            setError('السيارة غير موجودة');
          } else {
            setError('حدث خطأ في جلب البيانات');
          }
          setCar(null);
          return;
        }
        
        const data = await res.json();
        
        if (data.success && data.car) {
          setCar(data.car);
        } else {
          setError(data.error || 'لم يتم العثور على السيارة');
          setCar(null);
        }
      } catch (error) {
        console.error('خطأ في جلب التفاصيل:', error);
        setError('حدث خطأ في الاتصال بالخادم');
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [params?.id]);

  // دالة لاستخراج رابط الصورة
  const getImageUrl = (imagesData: any): string => {
    if (!imagesData) return '';

    if (Array.isArray(imagesData)) {
      return imagesData[0] ? String(imagesData[0]).trim() : '';
    }

    let str = String(imagesData).trim();

    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return String(parsed[0]).trim();
        }
      } catch (e) {
        str = str.replace(/[\[\]"']/g, '').split(',')[0];
      }
    }

    if (str.includes(',')) {
      return str.split(',')[0].trim();
    }

    return str;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#64748b' }}>⏳ جاري تحميل بيانات السيارة...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif', direction: 'rtl' }}>
        <h2 style={{ color: '#ef4444' }}>❌ {error || 'السيارة غير موجودة'}</h2>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>← العودة للمعرض الرئيسي</Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(car.images);

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: '15px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
          ← العودة لمعرض السيارات
        </Link>
        
        <h1 style={{ fontSize: '22px', margin: '0 0 15px 0', color: '#0f172a' }}>
          {car.brand} {car.model}
        </h1>

        <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          {imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) ? (
            <img 
              src={imageUrl} 
              alt={`${car.brand} ${car.model}`} 
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<div style="padding: 60px; color: #94a3b8; font-size: 14px;">🚗 لا توجد صورة متوفرة لهذا الإعلان</div>`;
                }
              }}
            />
          ) : (
            <div style={{ padding: '60px', color: '#94a3b8', fontSize: '14px' }}>🚗 لا توجد صورة متوفرة لهذا الإعلان</div>
          )}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', margin: '0 0 20px 0' }}>
          {Number(car.price).toLocaleString()} {car.currency || 'د.ك'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
            📅 سنة الصنع: <strong>{car.year || '---'}</strong>
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
            🛣️ الممشى: <strong>{car.kilometers ? Number(car.kilometers).toLocaleString() + ' كم' : '---'}</strong>
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
            🎨 اللون: <strong>{car.color || '---'}</strong>
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
            📊 الحالة: <strong>{car.status === 'approved' ? '✅ موافق عليه' : car.status || 'قيد المراجعة'}</strong>
          </p>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <h3 style={{ fontSize: '15px', margin: '0 0 10px 0', color: '#1e293b' }}>📝 تفاصيل الإعلان:</h3>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            {car.description || 'لا يوجد وصف إضافي مضاف.'}
          </p>
        </div>
      </div>
    </div>
  );
}
