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
    <div className="bg-slate-100 min-h-screen text-slate-800 dir-rtl pb-24 font-sans max-w-md mx-auto shadow-2xl relative">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo2.jpg" alt="سيارتي ستور" className="h-10 w-auto object-contain rounded-lg" />
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/login">
            <button className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all color-white text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1">
              <span>➕</span> أعلن مجاناً
            </button>
          </Link>
          <Link href="/login">
            <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1">
              <span>🔑</span> دخول
            </button>
          </Link>
        </div>
      </header>

      <main className="p-3 space-y-4">
        {/* Search Bar */}
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="ابحث عن سيارة، ماركة، موديل..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${showAdvanced ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <span>⚙️</span> تصفية
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <option value="">سنة الصنع...</option>
                {Array.from({ length: 2027 - 1988 + 1 }, (_, i) => 2027 - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>

              <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg">
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
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span>⭐</span> إعلانات مميزة
              </h2>
              <span className="text-[10px] text-slate-400">اسحب للجانب ↔️</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {cars.filter((car) => car.is_featured).map((car) => {
                const firstImage = getFirstImage(car.images);
                return (
                  <Link key={`feat-${car.id}`} href={`/car/${car.id}`} className="flex-shrink-0 w-40 group">
                    <div className="bg-white rounded-2xl overflow-hidden border border-amber-200 shadow-sm p-1.5 hover:shadow-md transition-all">
                      <div className="w-full h-24 bg-slate-100 rounded-xl overflow-hidden relative">
                        {firstImage ? (
                          <img src={firstImage} alt="car" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">🚗 لا توجد صورة</div>
                        )}
                        <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm">
                          ⭐ مميز
                        </span>
                      </div>
                      <div className="pt-2 px-1">
                        <h3 className="text-xs font-bold text-slate-800 truncate">{car.brand} {car.model}</h3>
                        <p className="text-xs font-black text-emerald-600 mt-0.5">
                          {car.price} <span className="text-[10px] font-normal">{car.currency || 'د.ك'}</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Cars Section */}
        <section className="space-y-2">
          <h2 className="text-xs font-black text-slate-800 px-1 flex items-center gap-1">
            <span>🚙</span> أحدث السيارات المعروضة
          </h2>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">⏳ جاري تحميل السيارات...</div>
          ) : cars.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              📭 لا توجد سيارات معروضة حالياً
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
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
                    <Link key={car.id} href={`/car/${car.id}`}>
                      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                        <div className="w-full h-28 bg-slate-100 relative overflow-hidden">
                          {firstImage ? (
                            <img src={firstImage} alt="car" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">🚗 لا توجد صورة</div>
                          )}
                          {car.status === 'sold' && (
                            <span className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow-sm">
                              💰 تم البيع
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 flex flex-col justify-between flex-1 space-y-1">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 truncate">{car.brand} {car.model}</h3>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                              {car.year && <span>📅 {car.year}</span>}
                              {car.kilometers && <span>• 📊 {car.kilometers.toLocaleString()} كم</span>}
                            </div>
                          </div>

                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-black text-emerald-600">
                              {car.price ? car.price.toLocaleString() : car.price} <span className="text-[9px] font-normal">{car.currency || 'د.ك'}</span>
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

      {/* Bottom App Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-between shadow-lg z-50">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-blue-600 font-bold text-[10px]">
          <span className="text-base">🏠</span>
          الرئيسية
        </Link>
        <Link href="/login" className="flex flex-col items-center gap-0.5 text-emerald-600 font-bold text-[10px]">
          <span className="text-base">➕</span>
          أضف إعلان
        </Link>
        <Link href="/login" className="flex flex-col items-center gap-0.5 text-slate-500 font-bold text-[10px]">
          <span className="text-base">👤</span>
          حسابي
        </Link>
      </nav>
    </div>
  );
}
