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
  
  // حالة جديدة للتحكم في فتح وإغلاق القائمة
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      
      {/* ===== Top Header (خلفية سيارة + قائمة منسدلة) ===== */}
      <header style={{
        position: 'sticky' as const,
        top: 0,
        zIndex: 50,
        width: '100%',
        height: 'clamp(140px, 25vw, 180px)', // ارتفاع ثابت ومناسب
        // استخدمنا صورة سيارة هنا (يمكنك تغيير رابط الصورة لاحقاً)
        backgroundImage: 'url("https://images.unsplash.com/photo-1503376712344-4c6b8f2e0c3b?q=80&w=2000&auto=format&fit=crop")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        boxSizing: 'border-box' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        
        {/* طبقة تظليل سوداء لضمان وضوح النص */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          zIndex: 1
        }} />

        {/* محتوى الهيدر */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 clamp(12px, 4vw, 20px)',
          maxWidth: '1200px',
        }}>
          
          {/* زر القائمة (3 خطوط) - على اليمين */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div style={{ width: '22px', height: '2px', backgroundColor: 'white', borderRadius: '2px' }}></div>
            <div style={{ width: '22px', height: '2px', backgroundColor: 'white', borderRadius: '2px' }}></div>
            <div style={{ width: '22px', height: '2px', backgroundColor: 'white', borderRadius: '2px' }}></div>
          </button>

          {/* اسم الموقع بدون الشعار الأبيض */}
          <Link href="/" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(22px, 6vw, 30px)',
              fontWeight: '900',
              color: '#ffffff',
              margin: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              letterSpacing: '1px'
            }}>
              سيارتي ستور
            </h1>
            <span style={{
              fontSize: 'clamp(11px, 3vw, 14px)',
              color: '#10b981',
              fontWeight: 'bold',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)'
            }}>
              🚗 اعثر على سيارتك
            </span>
          </Link>

          {/* مساحة فارغة لموازنة التصميم */}
          <div style={{ width: '46px' }}></div>

        </div>

        {/* ===== القائمة المنسدلة (Sidebar) ===== */}
        {isMenuOpen && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end' // تفتح من اليمين
          }}>
            <div style={{
              width: '75%',
              maxWidth: '300px',
              backgroundColor: 'white',
              height: '100%',
              boxShadow: '-5px 0 20px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s ease-out'
            }}>
              {/* رأس القائمة */}
              <div style={{
                padding: '20px',
                backgroundColor: '#1e293b',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>القائمة</h2>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* عناصر القائمة */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '16px', fontWeight: 'bold' }}>
                    🔑 تسجيل الدخول
                  </div>
                </Link>
                
                <Link href="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#059669', fontSize: '16px', fontWeight: 'bold' }}>
                    ➕ أعلن مجاناً
                  </div>
                </Link>

                <Link href="/about" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '16px', fontWeight: 'bold' }}>
                    ℹ️ من نحن
                  </div>
                </Link>

                <Link href="/faq" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '16px', fontWeight: 'bold' }}>
                    ❓ الأسئلة الشائعة
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main style={{ 
        padding: 'clamp(8px, 2vw, 14px)',
        maxWidth: '100%',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box' as const
      }}>
        {/* ===== Search Bar ===== */}
        <div style={{
          backgroundColor: 'white',
          padding: 'clamp(8px, 2vw, 12px)',
          borderRadius: 'clamp(10px, 2vw, 16px)',
          border: '1px solid #3d45eb',
          marginBottom: 'clamp(10px, 2vw, 16px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '100%',
          marginTop: '-20px', // سحب شريط البحث قليلاً ليتداخل مع الهيدر بشكل جميل
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', gap: 'clamp(6px, 1.5vw, 8px)', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="ابحث عن سيارة، ماركة، موديل..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{
                width: '100%',
                backgroundColor: '#f1f5f9',
                color: '#000000',
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                border: '1px solid #cbd5e1',
                outline: 'none',
                boxSizing: 'border-box' as const
              }}
            />
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px)',
                borderRadius: 'clamp(10px, 2vw, 14px)',
                fontSize: 'clamp(11px, 2.2vw, 12px)',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: showAdvanced ? '#2563eb' : '#f1f5f9',
                color: showAdvanced ? 'white' : '#475569'
              }}
            >
              ⚙️ فلتر
            </button>
          </div>

          {showAdvanced && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ width: '100%', padding: 'clamp(7px, 1.5vw, 9px)', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 'clamp(8px, 1.5vw, 10px)', fontSize: 'clamp(11px, 2.2vw, 12px)' }}>
                <option value="">سنة الصنع...</option>
                {Array.from({ length: 2027 - 1988 + 1 }, (_, i) => 2027 - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>

              <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} style={{ width: '100%', padding: 'clamp(7px, 1.5vw, 9px)', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 'clamp(8px, 1.5vw, 10px)', fontSize: 'clamp(11px, 2.2vw, 12px)' }}>
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
          <section style={{ marginBottom: 'clamp(14px, 3vw, 20px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(8px, 2vw, 10px)', padding: '0 2px' }}>
              <h2 style={{ fontSize: 'clamp(12px, 2.8vw, 14px)', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>⭐ إعلانات مميزة</h2>
              <span style={{ fontSize: 'clamp(10px, 2vw, 11px)', color: '#64748b' }}>اسحب لليمين او اليسار ↔️</span>
            </div>

            <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              {cars.filter((car) => car.is_featured).map((car) => {
                const firstImage = getFirstImage(car.images);
                return (
                  <Link key={`feat-${car.id}`} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, width: 'clamp(130px, 40vw, 160px)' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: 'clamp(10px, 2vw, 14px)', overflow: 'hidden', border: '1px solid #fde68a', padding: 'clamp(6px, 1.5vw, 8px)', boxShadow: '0 2px 5px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ width: '100%', height: 'clamp(80px, 25vw, 100px)', backgroundColor: '#f1f5f9', borderRadius: 'clamp(8px, 1.5vw, 10px)', overflow: 'hidden', position: 'relative', border: '1px solid #fbbf24' }}>
                        {firstImage ? (
                          <img src={firstImage} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '11px' }}>🚗 لا توجد صورة</div>
                        )}
                        <span style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' }}>⭐ مميز</span>
                      </div>
                      <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                        <h3 style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 'bold', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.brand} {car.model}</h3>
                        <p style={{ fontSize: 'clamp(12px, 2.8vw, 13px)', fontWeight: 'bold', color: '#059669', margin: 0 }}>
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
          <h2 style={{ fontSize: 'clamp(12px, 2.8vw, 14px)', fontWeight: 'bold', marginBottom: 'clamp(8px, 2vw, 10px)', padding: '0 2px', color: '#0f172a' }}>🚙 أحدث السيارات المعروضة</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px' }}>⏳ جاري تحميل السيارات...</div>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', backgroundColor: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
              📭 لا توجد سيارات معروضة حالياً
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2.5vw, 16px)' }}>
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
                      <div style={{ backgroundColor: 'white', borderRadius: 'clamp(12px, 2.5vw, 16px)', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ width: '100%', height: 'clamp(180px, 50vw, 240px)', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden', border: '1px solid #fbbf24' }}>
                          {firstImage ? (
                            <img src={firstImage} alt="car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>🚗 لا توجد صورة</div>
                          )}
                          {car.status === 'sold' && (
                            <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#10b981', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>💰 تم البيع</span>
                          )}
                          {car.is_featured && (
                            <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#f59e0b', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>⭐ مميز</span>
                          )}
                        </div>

                        <div style={{ padding: 'clamp(10px, 2.5vw, 16px)', display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1.5vw, 10px)' }}>
                          <h3 style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
                            {car.brand} {car.model}
                          </h3>
                          
                          <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', flexWrap: 'wrap', fontSize: 'clamp(11px, 2.5vw, 13px)', color: '#64748b' }}>
                            {car.year && <span>📅 {car.year}</span>}
                            {car.kilometers && <span>📊 {car.kilometers.toLocaleString()} كم</span>}
                            {car.color && <span>🎨 {car.color}</span>}
                          </div>

                          {car.description && (
                            <p style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                              {car.description.substring(0, 120)}{car.description.length > 120 ? '...' : ''}
                            </p>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'clamp(6px, 1.5vw, 10px)', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                            <span style={{ fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 'bold', color: '#059669' }}>
                              {car.price ? car.price.toLocaleString() : car.price} <span style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', fontWeight: 'normal' }}>{car.currency || 'د.ك'}</span>
                            </span>
                            <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: '#2563eb', fontWeight: 'bold' }}>
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
        padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 16px)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        zIndex: 50,
        maxWidth: '100%'
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#2563eb', textAlign: 'center', fontSize: 'clamp(10px, 2.2vw, 11px)', fontWeight: 'bold' }}>
          <div style={{ fontSize: 'clamp(18px, 4vw, 20px)', marginBottom: '2px' }}>🏠</div>
          الرئيسية
        </Link>
        
        <Link href="/login" style={{ textDecoration: 'none', color: '#059669', textAlign: 'center', fontSize: 'clamp(10px, 2.2vw, 11px)', fontWeight: 'bold' }}>
          <div style={{ fontSize: 'clamp(18px, 4vw, 20px)', marginBottom: '2px' }}>➕</div>
          أضف إعلان
        </Link>
        
        <a 
          href="mailto:admin@sayarty.store?subject=استفسار من موقع سيارتي ستور"
          style={{ textDecoration: 'none', color: '#dc2626', textAlign: 'center', fontSize: 'clamp(10px, 2.2vw, 11px)', fontWeight: 'bold' }}
        >
          <div style={{ fontSize: 'clamp(18px, 4vw, 20px)', marginBottom: '2px' }}>📧</div>
          اتصل بنا
        </a>
        
        <Link href="/login" style={{ textDecoration: 'none', color: '#64748b', textAlign: 'center', fontSize: 'clamp(10px, 2.2vw, 11px)', fontWeight: 'bold' }}>
          <div style={{ fontSize: 'clamp(18px, 4vw, 20px)', marginBottom: '2px' }}>👤</div>
          حسابي
        </Link>
      </nav>
    </div>
  );
}
