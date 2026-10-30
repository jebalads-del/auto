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

interface Dealer {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  address?: string;
  is_verified?: boolean;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterColor, setFilterColor] = useState('');
  
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
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const fetchData = async () => {
      try {
        setLoading(true);

        const now = new Date().toISOString();
        await supabase
          .from('cars')
          .update({ is_featured: false, featured_until: null })
          .lt('featured_until', now)
          .eq('is_featured', true);

        // جلب السيارات
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*')
          .in('status', ['approved', 'sold'])
          .order('created_at', { ascending: false });

        if (!carsError && carsData) setCars(carsData);

        // جلب المعارض والشركات
        const { data: dealersData, error: dealersError } = await supabase
          .from('dealers')
          .select('*')
          .limit(6);

        if (!dealersError && dealersData) setDealers(dealersData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMenuOpen(false);
    window.location.reload();
  };

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
      
      {/* ===== Top Header ===== */}
      <header style={{
        position: 'sticky' as const,
        top: 0,
        zIndex: 50,
        width: '100%',
        height: 'clamp(140px, 25vw, 180px)', 
        backgroundImage: 'url("/logo.png")', 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        boxSizing: 'border-box' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.2)',
          zIndex: 1
        }} />

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
          
          <button 
            onClick={() => setIsMenuOpen(true)}
            style={{
              backgroundColor: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ width: '22px', height: '2px', backgroundColor: '#0f172a', borderRadius: '2px' }}></div>
            <div style={{ width: '22px', height: '2px', backgroundColor: '#0f172a', borderRadius: '2px' }}></div>
            <div style={{ width: '22px', height: '2px', backgroundColor: '#0f172a', borderRadius: '2px' }}></div>
          </button>

          <Link href="/" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(22px, 6vw, 30px)',
              fontWeight: '900',
              color: '#ffffff',
              margin: 0,
              textShadow: '0px 4px 10px rgba(0,0,0,0.9), 0px 0px 20px rgba(0,0,0,0.6)',
              letterSpacing: '1px'
            }}>
              سيارتي ستور
            </h1>
            <span style={{
              fontSize: 'clamp(11px, 3vw, 14px)',
              color: '#10b981',
              fontWeight: 'bold',
              textShadow: '0px 2px 6px rgba(0,0,0,0.9)'
            }}>
              🚗 ابحث عن سيارتك المفضله 
            </span>
          </Link>

          <div style={{ width: '46px' }}></div>
        </div>

        {/* ===== Sidebar Menu ===== */}
        {isMenuOpen && (
          <>
            <div 
              onClick={() => setIsMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 100,
              }} 
            />
            
            <div style={{
              position: 'fixed',
              top: 0,
              right: 0, 
              bottom: 0,
              width: '75%',
              maxWidth: '300px',
              backgroundColor: 'white',
              zIndex: 101,
              boxShadow: '-5px 0 25px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              borderTopLeftRadius: '15px',
              borderBottomLeftRadius: '15px',
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#1e293b',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '15px',
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

              <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', overflowY: 'auto' }}>
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                      <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>👤</span> ملفي الشخصي
                      </div>
                    </Link>
                    <button onClick={handleSignOut} style={{ background: 'none', border: 'none', textAlign: 'right', padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#dc2626', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: '100%' }}>
                      <span style={{ fontSize: '20px' }}>🚪</span> تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🔑</span> تسجيل الدخول
                    </div>
                  </Link>
                )}
                
                <Link href={user ? "/profile" : "/login"} onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#059669', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>➕</span> أعلن مجاناً
                  </div>
                </Link>

                <Link href="/about" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>ℹ️</span> من نحن
                  </div>
                </Link>

                <Link href="/faq" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>❓</span> الأسئلة الشائعة
                  </div>
                </Link>
                <Link href="/privacy" onClick={() => setIsMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🔒</span> سياسة الخصوصية
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      <main style={{ 
        padding: 'clamp(8px, 2vw, 14px)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box' as const
      }}>
        
        {/* ===== Search Bar ===== */}
        <div style={{
          backgroundColor: 'white',
          padding: 'clamp(10px, 2.5vw, 14px)',
          borderRadius: 'clamp(12px, 2.5vw, 16px)',
          border: '2px solid #fbbf24', 
          marginBottom: 'clamp(15px, 3vw, 20px)',
          boxShadow: '0 6px 15px rgba(251, 191, 36, 0.15)', 
          width: '100%',
          marginTop: '15px', 
          position: 'relative',
          zIndex: 10,
          boxSizing: 'border-box' as const
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
            
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              style={{
                padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                borderRadius: 'clamp(10px, 2vw, 14px)',
                fontSize: 'clamp(12px, 2.5vw, 13px)',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: showAdvanced ? '#f59e0b' : '#fef3c7',
                color: showAdvanced ? 'white' : '#92400e',
                transition: 'all 0.2s ease',
                flexShrink: 0 
              }}
            >
              ⚙️ فلتر
            </button>

            <input 
              type="text" 
              placeholder="ابحث عن سيارة، ماركة، موديل..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{
                flex: 1, 
                minWidth: '0',
                backgroundColor: '#f8fafc',
                color: '#000000',
                fontSize: 'clamp(12px, 2.8vw, 14px)',
                padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                border: '1px solid #cbd5e1',
                outline: 'none',
                boxSizing: 'border-box' as const
              }}
            />
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

        {/* ===== Featured Dealers Section (المعارض والشركات الموثوقة) ===== */}
        {dealers.length > 0 && (
          <section style={{ marginBottom: 'clamp(20px, 4vw, 30px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(10px, 2vw, 12px)', padding: '0 2px' }}>
              <h2 style={{ fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>🏢 معارض وشركات السيارات</h2>
              <span style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#64748b' }}>اسحب للاستكشاف ↔️</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
              {dealers.map((dealer) => (
                <Link key={dealer.id} href={`/dealers/${dealer.slug}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, width: 'clamp(160px, 45vw, 200px)' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '16px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '10px', fontWeight: 'bold' }}>
                      {dealer.name ? dealer.name.charAt(0) : '🏢'}
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {dealer.name} {dealer.is_verified && <span style={{ color: '#2563eb' }} title="معرض موثق">✓</span>}
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0' }}>
                      📍 {dealer.address || 'السعودية'}
                    </p>
                    <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
                      تصفح المعرض
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== Featured Cars Horizontal Slider ===== */}
        {cars.filter((car) => car.is_featured).length > 0 && (
          <section style={{ marginBottom: 'clamp(14px, 3vw, 20px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(8px, 2vw, 10px)', padding: '0 2px' }}>
              <h2 style={{ fontSize: 'clamp(12px, 2.8vw, 14px)', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>⭐ إعلانات مميزة</h2>
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

        {/* ===== Recent Cars ===== */}
        <section>
          <h2 style={{ fontSize: 'clamp(12px, 2.8vw, 14px)', fontWeight: 'bold', marginBottom: 'clamp(8px, 2vw, 10px)', padding: '0 2px', color: '#0f172a' }}>🚙 أحدث السيارات
