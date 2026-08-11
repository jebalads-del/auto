'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCars(data.cars);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>⏳ جاري التحميل...</div>;

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      <h1>🚗 سيارتي</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {cars.map((car: any) => {
          // استخراج الصورة مباشرة
          let imageUrl = '/images/default-car.jpg';
          if (car.images) {
            if (typeof car.images === 'string') {
              // إذا كان نصاً، استخدمه مباشرة
              imageUrl = car.images;
            } else if (Array.isArray(car.images) && car.images.length > 0) {
              imageUrl = String(car.images[0]);
            }
          }
          // التأكد من أن الرابط صحيح
          if (!imageUrl.startsWith('http')) {
            imageUrl = '/images/default-car.jpg';
          }

          return (
            <div key={car.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <img
                src={imageUrl}
                alt={car.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-car.jpg';
                }}
              />
              <div style={{ padding: '10px' }}>
                <h3>{car.title}</h3>
                <p>{car.price} د.ك</p>
                <Link href={`/car/${car.id}`} style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '5px 10px', borderRadius: '5px', textDecoration: 'none' }}>
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
