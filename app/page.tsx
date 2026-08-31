'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  year?: number;
  kilometers?: number;
  color?: string;
  description?: string;
  currency?: string;
  status: string;
  created_at: string;
  images?: string[];
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ خطأ:', error);
        } else {
          console.log('✅ تم جلب الإعلانات:', data?.length || 0);
          setCars(data || []);
        }
      } catch (err) {
        console.error('❌ خطأ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [supabase]);

  return (
    <div style={{ direction: 'rtl', padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>🚗 سيارتي ستور</h1>
        <Link href="/dashboard">
          <button style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            لوحة التحكم
          </button>
        </Link>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>
        🚙 أحدث الإعلانات
      </h2>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          ⏳ جاري تحميل الإعلانات...
        </div>
      )}

      {!loading && (
        <>
          {cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px' }}>
              <p style={{ fontSize: '18px', color: '#64748b' }}>📭 لا توجد إعلانات متاحة حالياً</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {cars.map((car) => {
                const firstImage = car.images && car.images.length > 0 ? car.images[0] : null;
                
                return (
                  <div key={car.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    
                    {firstImage ? (
                      <div style={{ marginBottom: '12px' }}>
                        <img 
                          src={firstImage} 
                          alt={`${car.brand} ${car.model}`}
                          style={{ 
                            width: '100%', 
                            height: '200px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            backgroundColor: '#f1f5f9'
                          }}
                          onError={(e) => {
                            console.error('❌ خطأ في تحميل الصورة:', firstImage);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '200px', 
                        backgroundColor: '#e2e8f0', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontSize: '14px',
                        marginBottom: '12px'
                      }}>
                        🚗 لا توجد صورة
                      </div>
                    )}

                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>
                      {car.brand} {car.model}
                    </div>
                    <div style={{ color: '#16a34a', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                      {car.price} {car.currency || 'د.ك'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {car.year && <span>📅 {car.year}</span>}
                      {car.kilometers && <span style={{ marginRight: '10px' }}>📊 {car.kilometers.toLocaleString()} كم</span>}
                      {car.color && <span style={{ marginRight: '10px' }}>🎨 {car.color}</span>}
                    </div>
                    {car.description && (
                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                        {car.description.substring(0, 100)}...
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>
                      🕐 {new Date(car.created_at).toLocaleDateString('ar-KW')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', color: '#94a3b8', fontSize: '14px', borderTop: '1px solid #e2e8f0' }}>
        © 2026 سيارتي ستور - جميع الحقوق محفوظة
      </div>
    </div>
  );
}
