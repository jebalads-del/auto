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
    fetch(`/api/cars/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCar(data.car);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>⏳ جاري التحميل...</div>;
  if (!car) return <div style={{ padding: '50px', textAlign: 'center' }}>❌ السيارة غير موجودة</div>;

  let imageUrl = '/images/default-car.jpg';
  if (car.images) {
    if (typeof car.images === 'string') {
      imageUrl = car.images;
    } else if (Array.isArray(car.images) && car.images.length > 0) {
      imageUrl = car.images[0];
    }
  }

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/">← العودة لمعرض السيارات</Link>
      <h1>{car.brand} {car.model}</h1>
      
      <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden', borderRadius: '8px', background: '#f1f5f9' }}>
        <img
          src={imageUrl}
          alt={car.model}
          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
          unoptimized={true}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/default-car.jpg';
          }}
        />
      </div>

      <p><strong>السعر:</strong> {car.price} د.ك</p>
      <p><strong>السنة:</strong> {car.year || '---'}</p>
      <p><strong>اللون:</strong> {car.color || '---'}</p>
      <p><strong>المسافة:</strong> {car.kilometers ? `${car.kilometers} كم` : '---'}</p>
      <p><strong>الوصف:</strong> {car.description || 'لا يوجد وصف'}</p>
      <p><strong>الحالة:</strong> {car.status === 'approved' ? '✅ موافق عليه' : car.status || 'قيد المراجعة'}</p>
    </div>
  );
}
