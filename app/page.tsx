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

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ جاري التحميل...</div>;

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>🚗 سيارتي</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {cars.map((car: any) => {
          // استخراج الصورة مباشرة
          let imageUrl = '/images/default-car.jpg';
          if (car.images) {
            if (typeof car.images === 'string') {
              // إذا كان رابطاً، استخدمه
              if (car.images.startsWith('http')) {
                imageUrl = car.images;
              }
            } else if (Array.isArray(car.images) && car.images.length > 0) {
              const first = String(car.images[0]);
              if (first.startsWith('http')) {
                imageUrl = first;
              }
            }
          }

          return (
            <div key={car.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
              <div style={{ width: '100%', height: '200px', background: '#f1f5f9', overflow: 'hidden' }}>
                <img
                  src={imageUrl}
                  alt={car.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // إذا فشلت الصورة، استخدم الصورة الافتراضية
                    (e.target as HTMLImageElement).src = '/images/default-car.jpg';
                  }}
                />
              </div>
              <div style={{ padding: '10px' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{car.title}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#059669', fontWeight: 'bold' }}>{car.price} د.ك</p>
                <Link
                  href={`/car/${car.id}`}
                  style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '8px 15px', borderRadius: '5px', textDecoration: 'none' }}
                >
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
