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
        const res = await fetch(`/api/cars/${params.id}`);
        const data = await res.json();
        console.log('📸 بيانات السيارة:', data);
        if (data.success && data.car) {
          setCar(data.car);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [params?.id]);

  // ✅ دالة صحيحة لاستخراج الصورة
  const getImageUrl = (imagesInput: any): string => {
    if (!imagesInput) return '';
    
    if (typeof imagesInput === 'string') {
      return imagesInput.trim();
    }
    
    if (Array.isArray(imagesInput) && imagesInput.length > 0) {
      return String(imagesInput[0]).trim();
    }
    
    return '';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ جاري التحميل...</div>;
  }

  if (!car) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>❌ السيارة غير موجودة</h2>
        <Link href="/">← العودة للمعرض</Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(car.images);
  console.log('🖼️ رابط الصورة المستخرج:', imageUrl);

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/">← العودة لمعرض السيارات</Link>

      <h1>{car.brand} {car.model}</h1>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={car.model}
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
          onError={(e) => {
            console.error('❌ فشل تحميل الصورة:', imageUrl);
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.innerHTML = '<div style="padding:50px;background:#f1f5f9;text-align:center;border-radius:8px;">🚗 لا توجد صورة</div>';
            }
          }}
        />
      ) : (
        <div style={{ padding: '50px', backgroundColor: '#f1f5f9', textAlign: 'center', borderRadius: '8px' }}>
          🚗 لا توجد صورة
        </div>
      )}

      <p><strong>السعر:</strong> {car.price} د.ك</p>
      <p><strong>السنة:</strong> {car.year || '---'}</p>
      <p><strong>اللون:</strong> {car.color || '---'}</p>
      <p><strong>المسافة:</strong> {car.kilometers ? `${car.kilometers} كم` : '---'}</p>
      <p><strong>الوصف:</strong> {car.description || 'لا يوجد وصف'}</p>
      <p><strong>الحالة:</strong> {car.status === 'approved' ? '✅ موافق عليه' : car.status || 'قيد المراجعة'}</p>
    </div>
  );
}
