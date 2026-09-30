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

  // تم إرجاع الدالة الأصلية السليمة تماماً لإظهار الإعلانات دون مشاكل
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
      {/* Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* تم تكبير حجم صورة لوجو البانر هنا لتصبح أوضح وأكبر */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo2.jpg" alt="سيارتي ستور" style={{ height: '52px', width: 'auto', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <a 
            href="mailto:admin@sayarty.store?subject=إستفسار بخصوص موقع سيارتي&body=مرحباً إدارة موقع سيارتي،" 
            title="تواصل معنا"
            style={{ 
              textDecoration: 'none',
              backgroundColor: '#475569',
              color: 'white',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
          >
            ✉️
          </a>

          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '34px'
            }}>
              <span>➕</span> أعلن مجاناً
            </button>
          </Link>
          
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '34px'
            }}>
              <span>🔑</span> دخول
            </button>
          </Link>
        </div>
      </header>

      <main style={{ 
        padding: '14px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Search Bar */}
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

        {/* Featured Cars Horizontal Slider */}
        {cars.filter((car) => car.is_featured).length > 0 && (
          <section style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>⭐ إعلانات مميزة</h2>
              <span style={{ fontSize: '11px', color: '#64748b' }}>اسحب للجانب ↔️</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
               {/* محتوى السلايدر يستكمل هنا بشكل طبيعي */}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
