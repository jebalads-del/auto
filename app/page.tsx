'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface Car {
  id: string; brand: string; model: string; price: number;
  year?: number; kilometers?: number; color?: string;
  description?: string; currency?: string; status: string;
  created_at: string; images?: string[];
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. متغيرات محرك البحث المدمج والخفيف لعدم إشغال مساحة
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
          .eq('status', 'approved')
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
<div style={{ direction: 'rtl', padding: '16px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* الـ Header الفاخر المطور - تم إجبار التوزيع ليكون عمودياً للأزرار بشكل قاطع */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px 16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
        
        {/* عنوان الموقع الجذاب */}
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>🚗 سيارتي ستور</h1>
        
        {/* صندوق عمودي صارم (flexDirection: column) يُجبر الأزرار أن تكون مستطيلة ومتساوية وتحت بعضها فوراً */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '120px', alignItems: 'stretch', justifyContent: 'center' }}>
          
          {/* 1. زر نشر الإعلان الأخضر المستطيل (العلوي) */}
          <Link href="/login" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
            <button style={{ width: '100%', padding: '9px 0', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(22,163,74,0.15)', textAlign: 'center', display: 'block', boxSizing: 'border-box' }}>
              ➕ نشر إعلان
            </button>
          </Link>

          {/* 2. زر دخول حسابي الأزرق المستطيل والمتطابق تماماً وتحته مباشرة (السفلي) */}
          <Link href="/login" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
            <button style={{ width: '100%', padding: '9px 0', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.15)', textAlign: 'center', display: 'block', boxSizing: 'border-box' }}>
              🔑 دخول
            </button>
          </Link>

        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b', paddingRight: '4px' }}>
        🚙 أحدث السيارات المعروضة
      </h2>
          {/* 🛠️ محرك البحث المطور بالقوائم المنسدلة التلقائية الموفرة للمساحة */}
      <div style={{ backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="ابحث عن ماركة أو موديل السيارة..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#f8fafc' }}
          />
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            style={{ padding: '9px 12px', backgroundColor: showAdvanced ? '#2563eb' : '#f1f5f9', color: showAdvanced ? '#fff' : '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            🔍 تصفية
          </button>
        </div>

        {/* القوائم المنسدلة الشاملة للسنوات والألوان لتوفر المساحة */}
        {showAdvanced && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            
            {/* 1. قائمة منسدلة السنوات من 2027 نزولاً إلى 1988 */}
            <div>
              <select 
                value={filterYear} 
                onChange={(e) => setFilterYear(e.target.value)} 
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white', boxSizing: 'border-box' }}
              >
                <option value="">اختر سنة الصنع...</option>
                {Array.from({ length: 2027 - 1988 + 1 }, (_, i) => 2027 - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>

            {/* 2. قائمة منسدلة الألوان الشاملة المتطابقة مع مدخلات الإعلان */}
            <div>
              <select 
                value={filterColor} 
                onChange={(e) => setFilterColor(e.target.value)} 
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', backgroundColor: 'white', boxSizing: 'border-box' }}
              >
                <option value="">اختر اللون...</option>
                {['أسود', 'أبيض', 'أحمر', 'أزرق', 'رمادي', 'فضي', 'ذهبي', 'بني', 'أخضر', 'أصفر', 'برتقالي', 'أرجواني', 'وردي', 'بيج', 'نحاسي'].map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

          </div>
        )}
      </div>


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
            /* شبكة العرض العصرية المكونة من صفين متناسقين تماماً مع دالة الفلترة الذكية المدمجة */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {cars
                .filter((car) => {
                  const matchesQuery = !searchQuery || 
                    car.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    car.model?.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesYear = !filterYear || car.year?.toString() === filterYear;
                  const matchesColor = !filterColor || car.color?.toLowerCase().includes(filterColor.toLowerCase());
                  return matchesQuery && matchesYear && matchesColor;
                })
                .map((car) => {
                  const firstImage = car.images && car.images.length > 0 ? car.images : null;
                  
                  return (
                    <Link key={car.id} href={`/car/${car.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', transition: '0.2s' }}>
                        
                        {/* 1. الصورة بتنسيق زوايا دائرية فاخرة */}
                        {firstImage ? (
                          <div style={{ width: '100%', height: '130px', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
                            <img 
                              src={Array.isArray(firstImage) ? firstImage[0] : (firstImage || '')}
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

    {/* الـ Footer النظيف */}
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px 0', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #e2e8f0' }}>
      © 2026 سيارتي ستور - جميع الحقوق محفوظة
    </div>
  </div>
);
}
