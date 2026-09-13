'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface Car {
  id: string; brand: string; model: string; price: number;
  year?: number; kilometers?: number; color?: string;
  description?: string; currency?: string; status: string;
  created_at: string; images?: string[]; is_featured?: boolean;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterColor, setFilterColor] = useState('');

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
          .in('status', ['approved', 'sold'])
          .order('created_at', { ascending: false });

        if (!error && data) setCars(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [supabase]);
  return (
    <div style={{ direction: 'rtl', padding: '12px 6px', maxWidth: '100%', margin: '0', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          {/* 👑 الهيدر المطور والموزون هندسياً */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: 'white', padding: '12px 6px 12px 12px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', gap: '6px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexGrow: 1, height: '65px', overflow: 'hidden', borderRadius: '6px' }}>
          <img src="/logo2.jpg" alt="سيارتي ستور" style={{ height: '100%', width: '100%', objectFit: 'fill' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '105px', flexShrink: 0 }}>
          <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}><button style={{ width: '100%', padding: '8px 0', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>➕ أعلن مجانا</button></Link>
          <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}><button style={{ width: '100%', padding: '8px 0', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>🔑 دخول</button></Link>
        </div>
      </div>


      {/* 🔥 شريط السيارات المميزة المتحرك أفقياً باليد (Horizontal Scroll) */}
      <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', paddingRight: '4px' }}>⭐ إعلانات مميزة (اسحب لليسار او اليمين ↔️)</h2>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {cars.slice(0, 4).map((car) => {
          const firstImage = car.images && car.images.length > 0 ? car.images[0] : null;
          return (
            <Link key={`feat-${car.id}`} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, width: '160px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid #cbd5e1', padding: '6px' }}>
                <div style={{ width: '100%', height: '90px', backgroundColor: '#f8fafc', overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
                  {firstImage ? <img src={firstImage} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px' }}>🚗 لا توجد صورة</div>}
                  <div style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#eab308', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>⭐ مميز</div>
                </div>
                <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: '6px 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.brand} {car.model}</h3>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#16a34a' }}>{car.price} <span style={{ fontSize: '10px', fontWeight: 'normal' }}>{car.currency || 'د.ك'}</span></span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 🔍 محرك البحث وقوائم التصفية الشاملة */}
      <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', paddingRight: '4px' }}>🚙  تصفح احدث السيارات او ابحث عن سيارتك المفضله</h2>
      <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="text" placeholder="ابحث عن ماركة أو موديل السيارة..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }} />
          <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ padding: '9px 12px', backgroundColor: showAdvanced ? '#2563eb' : '#f1f5f9', color: showAdvanced ? '#fff' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }}>🔍 تصفية</button>
        </div>
        {showAdvanced && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <div>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }}>
                <option value="">اختر سنة الصنع...</option>
                {Array.from({ length: 2027 - 1988 + 1 }, (_, i) => 2027 - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white' }}>
                <option value="">اختر اللون...</option>
                {['أسود', 'أبيض', 'أحمر', 'أزرق', 'رمادي', 'فضي', 'ذهبي', 'بني', 'أخضر', 'أصفر', 'برتقالي', 'أرجواني', 'وردي', 'بيج', 'نحاسي'].map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px' }}>⏳ جاري تصفح أحدث السيارات...</div>}

      {!loading && (
        <>
          {cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}><p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>📭 لا توجد سيارات معروضة للبيع حالياً</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {cars
                .filter((car) => {
                  const matchesQuery = !searchQuery || car.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || car.model?.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesYear = !filterYear || car.year?.toString() === filterYear;
                  const matchesColor = !filterColor || car.color?.toLowerCase().includes(filterColor.toLowerCase());
                  return matchesQuery && matchesYear && matchesColor;
                })
                .map((car) => {
                  const firstImage = car.images && car.images.length > 0 ? car.images[0] : null;
                  return (
                    <Link key={car.id} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                        <div style={{ width: '100%', height: '130px', backgroundColor: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
                          {firstImage ? <img src={firstImage} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>🚗 لا توجد صورة</div>}
                          {car.status === 'sold' && <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', zIndex: 2 }}>🔒 مباعة</div>}
                        </div>
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.brand} {car.model}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                            {car.year && <span>📅 {car.year}</span>}
                            {car.kilometers && <span>• 📊 {car.kilometers.toLocaleString()} كم</span>}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '6px' }}>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: '#16a34a' }}>{car.price} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>{car.currency || 'د.ك'}</span></span>
                          </div>
                        </div>
                        <div style={{ padding: '0 12px 12px 12px' }}>
                          <button style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>تفاصيل الإعلان 👀</button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px 0', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #e2e8f0' }}>© 2026 سيارتي ستور - جميع الحقوق محفوظة</div>
    </div>
  );
}
