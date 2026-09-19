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
  images?: any; 
  is_featured?: boolean;
  featured_until?: string;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [isApp, setIsApp] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  // دالة مساعدة لاستخراج أول صورة بشكل آمن
  const getFirstImage = (images: any): string | null => {
    if (!images) return null;
    if (Array.isArray(images) && images.length > 0) return images[0];
    if (typeof images === 'string') {
      const clean = images.trim();
      if (clean.startsWith('[') && clean.endsWith(']')) {
        try {
          const parsed = JSON.parse(clean);
          return parsed.length > 0 ? parsed[0] : null;
        } catch { return null; }
      }
      if (clean.startsWith('http')) return clean;
      const splitArr = clean.split(',').map(s => s.trim()).filter(Boolean);
      return splitArr.length > 0 ? splitArr[0] : null;
    }
    return null;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || '';
      if (userAgent.includes('MobileApp') || window.location.search.includes('mode=app')) {
        setIsApp(true);
      }
    }

    const fetchCars = async () => {
      try {
        setLoading(true);

        const now = new Date().toISOString();
        await supabase
          .from('cars')
          .update({ is_featured: false, featured_until: null })
          .lt('featured_until', now)
          .eq('is_featured', true);

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
    <div style={{ 
      direction: 'rtl', 
      padding: '12px 8px', 
      paddingBottom: isApp ? '80px' : '20px',
      maxWidth: '600px', 
      margin: '0 auto', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: 'sans-serif' 
    }}>
      
      {/* 👑 الهيدر */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexGrow: 1, height: '60px', overflow: 'hidden', borderRadius: '8px' }}>
          <img src="/logo2.jpg" alt="سيارتي ستور" style={{ height: '100%', width: '100%', objectFit: 'contain', objectPosition: 'right' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100px', flexShrink: 0 }}>
          <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}>
            <button style={{ width: '100%', padding: '8px 0', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>➕ أعلن مجانا</button>
          </Link>
          <Link href="/login" style={{ textDecoration: 'none', width: '100%' }}>
            <button style={{ width: '100%', padding: '8px 0', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>🔑 دخول</button>
          </Link>
        </div>
      </div>

      {/* 🔍 محرك البحث */}
      <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="ابحث عن ماركة أو موديل السيارة..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }} 
          />
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            style={{ padding: '10px 12px', backgroundColor: showAdvanced ? '#2563eb' : '#f1f5f9', color: showAdvanced ? '#fff' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
          >
            🔍 تصفية
          </button>
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

      {/* ⭐ الإعلانات المميزة */}
      {cars.filter((car) => car.is_featured).length > 0 && (
        <>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', paddingRight: '4px' }}>⭐ إعلانات مميزة (اسحب لليسار ↔️)</h2>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px', scrollbarWidth: 'none' }}>
            {cars.filter((car) => car.is_featured).map((car) => {
              const firstImage = getFirstImage(car.images);
              return (
                <Link key={`feat-${car.id}`} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, width: '160px' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #cbd5e1', padding: '6px' }}>
                    <div style={{ width: '100%', height: '100px', backgroundColor: '#f8fafc', overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
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
        </>
      )}

      {/* 🚙 قسم السيارات */}
      <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b', paddingRight: '4px' }}>🚙 تصفح أحدث السيارات</h2>

      {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '15px' }}>⏳ جاري تصفح أحدث السيارات...</div>}

      {!loading && (
        <>
          {cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>📭 لا توجد سيارات معروضة للبيع حالياً</p>
            </div>
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
                  const firstImage = getFirstImage(car.images);
                  return (
                    <Link key={car.id} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
                        <div style={{ width: '100%', height: '120px', backgroundColor: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
                          {firstImage ? <img src={firstImage} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>🚗 لا توجد صورة</div>}
                          {car.status === 'sold' && <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', zIndex: 2 }}>💰 تم البيع</div>}
                        </div>
                        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                          <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.brand} {car.model}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                            {car.year && <span>📅 {car.year}</span>}
                            {car.kilometers && <span>• 📊 {car.kilometers.toLocaleString()} كم</span>}
                          </div>
                          <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#16a34a' }}>{car.price ? car.price.toLocaleString() : car.price} <span style={{ fontSize: '11px', fontWeight: 'normal' }}>{car.currency || 'د.ك'}</span></span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </>
      )}

      {/* 📞 قسم التواصل مع الإدارة */}
      <div style={{ 
        margin: '30px auto 0', 
        padding: '16px', 
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>📞 تواصل مع الإدارة</h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>هل لديك استفسار أو اقتراح؟ نحن هنا لمساعدتك</p>
        </div>

        <a 
          href="mailto:admin@sayarty.com?subject=استفسار من موقع سيارتي" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px',
            padding: '12px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            borderRadius: '10px', 
            textDecoration: 'none', 
            fontSize: '13px', 
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          📧 راسلنا عبر الإيميل
        </a>
      </div>

      {/* 📱 شريط تنقل سفلي خاص بالتطبيق فقط */}
      {isApp && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          borderTop: '1px solid #e2e8f0',
          zIndex: 9999
        }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#2563eb', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
            <div style={{ fontSize: '18px' }}>🏠</div>
            الرئيسية
          </Link>
          <Link href="/login" style={{ textDecoration: 'none', color: '#16a34a', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
            <div style={{ fontSize: '18px' }}>➕</div>
            أضف إعلان
          </Link>
          <Link href="/login" style={{ textDecoration: 'none', color: '#64748b', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
            <div style={{ fontSize: '18px' }}>👤</div>
            حسابي
          </Link>
        </div>
      )}

      {/* حقوق النشر */}
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px 0', color: '#94a3b8', fontSize: '11px', borderTop: '1px solid #e2e8f0' }}>
        © 2026 سيارتي ستور - جميع الحقوق محفوظة
      </div>
    </div>
  );
}
