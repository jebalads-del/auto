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

  // المزامنة الذكية لمتغيرات البيئة لضمان جلب البيانات دون انقطاع
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

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
          console.error('❌ خطأ في جلب البيانات:', error);
        } else {
          console.log('✅ تم جلب الإعلانات بنجاح:', data?.length || 0);
          setCars(data || []);
        }
      } catch (err) {
        console.error('❌ خطأ غير متوقع:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [supabase]);

  return (
    <div style={{ direction: 'rtl', padding: '16px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* الـ Header الفاخر المطور بالأزرار المتناسقة والمصغرة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '12px 16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>🚗 سيارتي ستور</h1>
        
        {/* صندوق الأزرار الجانبية المصغرة والأنيقة */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 1. زر نشر الإعلان الأخضر الموجه لتسجيل الدخول */}
          <Link href="/login">
            <button style={{ padding: '8px 14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 6px rgba(22,163,74,0.2)' }}>
              ➕ نشر إعلان
            </button>
          </Link>

          {/* 2. زر دخول حسابي الأزرق المصغر لتناسق الهيدر */}
          <Link href="/login">
            <button style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' }}>
              🔑 دخول
            </button>
          </Link>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b', paddingRight: '4px' }}>
        🚙 أحدث السيارات المعروضة
      </h2>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px' }}>
          ⏳ جاري تصفح أحدث السيارات الفاخرة...
        </div>
      )}

      {!loading && (
        <>
          {cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>📭 لا توجد سيارات معروضة للبيع حالياً</p>
            </div>
          ) : (
            /* شبكة العرض العصرية المكونة من صفين متناسقين تماماً */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {cars.map((car) => {
                const firstImage = car.images && car.images.length > 0 ? car.images[0] : null;
                
                return (
                  <Link key={car.id} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', transition: '0.2s' }}>
                      
                      {/* 1. الصورة بتنسيق زوايا دائرية فاخرة */}
                      {firstImage ? (
                        <div style={{ width: '100%', height: '130px', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                          <img 
                            src={firstImage} 
                            alt={`${car.brand} ${car.model}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              console.error('❌ خطأ في الصورة:', firstImage);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: '130px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                          🚗 لا توجد صورة
                        </div>
                      )}

                      {/* 2. بيانات السيارة الأساسية بتصميم مريح وبسيط */}
                      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {car.brand} {car.model}
                        </h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                          {car.year && <span>📅 {car.year}</span>}
                          {car.kilometers && <span>• 📊 {car.kilometers.toLocaleString()} كم</span>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#16a34a' }}>
                            {car.price} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>{car.currency || 'د.ك'}</span>
                          </span>
                        </div>
                      </div>

                      {/* 3. زر التفاصيل السفلي الأنيق لزيادة الجمال البصري */}
                      <div style={{ padding: '0 12px 12px 12px' }}>
                        <button style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          تفاصيل الإعلان 👀
                        </button>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* الـ Footer */}
      <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px 0', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #e2e8f0' }}>
        © 2026 سيارتي ستور - جميع الحقوق محفوظة
      </div>
    </div>
  );
}
