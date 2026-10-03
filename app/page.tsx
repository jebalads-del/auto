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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

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
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#1e293b',
      paddingBottom: '85px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* ===== Top Header - بانر احترافي ===== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundImage: 'url(/logo.png)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        padding: '20px 16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '130px',
        overflow: 'hidden'
      }}>
        {/* طبقة داكنة خفيفة لتحسين القراءة */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.55) 100%)',
          zIndex: 1
        }} />
        
        {/* المحتوى */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: '14px',
          flexWrap: 'wrap',
          minHeight: '90px'
        }}>
          {/* الشعار + الاسم + السلوغان */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '8px',
              borderRadius: '14px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
              flexShrink: 0,
              border: '2px solid rgba(251,191,36,0.5)'
            }}>
              <img 
                src="/logo2.jpg" 
                alt="سيارتي ستور" 
                style={{ 
                  height: '62px', 
                  width: 'auto', 
                  borderRadius: '8px', 
                  objectFit: 'contain',
                  display: 'block'
                }} 
              />
            </div>
            
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: 0,
                textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 0 20px rgba(251,191,36,0.4)',
                lineHeight: '1.2',
                letterSpacing: '1px'
              }}>
                سيارتي ستور
              </h1>
              <p style={{
                fontSize: '13px',
                color: '#fbbf24',
                margin: '4px 0 0 0',
                fontWeight: '600',
                textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                letterSpacing: '0.5px'
              }}>
                🚗 سوقك الموثوق للسيارات
              </p>
            </div>
          </div>

          {/* الأزرار */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '11px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 14px rgba(16,185,129,0.5)',
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s'
              }}>
                <span>➕</span> أعلن مجاناً
              </button>
            </Link>
            
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button style={{
                backgroundColor: '#fbbf24',
                color: '#1e3a8a',
                border: 'none',
                padding: '11px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 14px rgba(251,191,36,0.5)',
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s'
              }}>
                <span>🔑</span> دخول
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main style={{ 
        padding: '14px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* ===== Search Bar ===== */}
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="ابحث عن سيارة، ماركة، موديل..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{
                width: '100%',
                backgroundColor: '#f1f5f9',
                color: '#1e293b',
                fontSize: '13px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: showAdvanced ? '#2563eb' : '#f1f5f9',
                color: showAdvanced ? 'white' : '#475569'
              }}
            >
              ⚙️ تصفية
            </button>
          </div>

          {showAdvanced && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: '100%', padding: '9px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '12px' }}>
                <option value="">سنة الصنع...</option>
                {Array.from({ length: 2027 - 1988 + 1 }, (_, i) => 2027 - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>

              <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} style={{ width: '100%', padding: '9px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '12px' }}>
                <option value="">اللون...</option>
                {['أسود', 'أبيض', 'أحمر', 'أزرق', 'رمادي', 'فضي', 'ذهبي', 'بيج'].map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ===== Featured Cars Horizontal Slider ===== */}
        {cars.filter((car) => car.is_featured).length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>⭐ إعلانات مميزة</h2>
              <span style={{ fontSize: '11px', color: '#64748b' }}>اسحب للجانب ↔️</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              {cars.filter((car) => car.is_featured).map((car) => {
                const firstImage = getFirstImage(car.images);
                return (
                  <Link key={`feat-${car.id}`} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, width: '150px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', border: '1px solid #fde68a', padding: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ width: '100%', height: '100px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                        {firstImage ? (
                          <img src={firstImage} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px' }}>🚗 لا توجد صورة</div>
                        )}
                        <span style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' }}>⭐ مميز</span>
                      </div>
                      <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.brand} {car.model}</h3>
                        <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#059669', margin: 0 }}>
                          {car.price} <span style={{ fontSize: '10px', fontWeight: 'normal' }}>{car.currency || 'د.ك'}</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== Recent Cars - عمود واحد ===== */}
        <section>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', padding: '0 2px', color: '#0f172a' }}>🚙 أحدث السيارات المعروضة</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px' }}>⏳ جاري تحميل السيارات...</div>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
              📭 لا توجد سيارات معروضة حالياً
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    <Link key={car.id} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ width: '100%', height: '240px', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                          {firstImage ? (
                            <img src={firstImage} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>🚗 لا توجد صورة</div>
                          )}
                          {car.status === 'sold' && (
                            <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#e11d48', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>💰 تم البيع</span>
                          )}
                          {car.is_featured && (
                            <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#f59e0b', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>⭐ مميز</span>
                          )}
                        </div>

                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                            {car.brand} {car.model}
                          </h3>
                          
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
                            {car.year && <span>📅 {car.year}</span>}
                            {car.kilometers && <span>📊 {car.kilometers.toLocaleString()} كم</span>}
                            {car.color && <span>🎨 {car.color}</span>}
                          </div>

                          {car.description && (
                            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                              {car.description.substring(0, 120)}{car.description.length > 120 ? '...' : ''}
                            </p>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#059669' }}>
                              {car.price ? car.price.toLocaleString() : car.price} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>{car.currency || 'د.ك'}</span>
                            </span>
                            <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold' }}>
                              التفاصيل ←
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </section>
      </main>

      {/* ===== Bottom Navigation Bar ===== */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #e2e8f0',
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        zIndex: 50,
        maxWidth: '100%'
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#2563eb', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>🏠</div>
          الرئيسية
        </Link>
        
        <Link href="/login" style={{ textDecoration: 'none', color: '#059669', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>➕</div>
          أضف إعلان
        </Link>
        
        <a 
          href="mailto:admin@sayarty.store?subject=استفسار من موقع سيارتي ستور"
          style={{ textDecoration: 'none', color: '#dc2626', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}
        >
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>📧</div>
          اتصل بنا
        </a>
        
        <Link href="/login" style={{ textDecoration: 'none', color: '#64748b', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
          <div style={{ fontSize: '20px', marginBottom: '2px' }}>👤</div>
          حسابي
        </Link>
      </nav>
    </div>
  );
}
