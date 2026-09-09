'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Car {
  id: string;
  brand: string;
  model: string;
  year?: number;
  price: number;
  kilometers?: number;
  color?: string;
  description?: string;
  currency?: string;
  status: string;
  created_at: string;
  images?: string[];
  user_id?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [maxKilometers, setMaxKilometers] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // جلب الماركات للقائمة المنسدلة
  useEffect(() => {
    const fetchBrands = async () => {
      const { data } = await supabase
        .from('cars')
        .select('brand')
        .in('status', ['approved', 'sold']);
      
      if (data) {
        const uniqueBrands = [...new Set(data.map(car => car.brand))].filter(Boolean);
        setBrands(uniqueBrands);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('cars')
          .select('*')
          .in('status', ['approved', 'sold'])
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
        }

        if (selectedBrand) {
          query = query.eq('brand', selectedBrand);
        }

        if (minPrice) {
          query = query.gte('price', parseInt(minPrice));
        }
        if (maxPrice) {
          query = query.lte('price', parseInt(maxPrice));
        }

        if (minYear) {
          query = query.gte('year', parseInt(minYear));
        }
        if (maxYear) {
          query = query.lte('year', parseInt(maxYear));
        }

        if (maxKilometers) {
          query = query.lte('kilometers', parseInt(maxKilometers));
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ خطأ في جلب السيارات:', error);
        } else {
          setCars(data || []);
        }
      } catch (err) {
        console.error('❌ خطأ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [searchTerm, selectedBrand, minPrice, maxPrice, minYear, maxYear, maxKilometers]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const resetFilters = () => {
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setMinYear('');
    setMaxYear('');
    setMaxKilometers('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>⏳ جاري تحميل السيارات...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.headerTitle}>🚗 سيارتي</h1>
            <p style={styles.headerSub}>سوق السيارات في الكويت</p>
          </div>
          <div style={styles.headerButtons}>
            {user ? (
              <>
                <Link href="/dashboard/cars/new" style={styles.newAdButton}>
                  ➕ إعلان جديد
                </Link>
                <Link href="/profile" style={styles.profileButton}>
                  👤 {user.email?.split('@')[0] || 'حسابي'}
                </Link>
                <button onClick={handleLogout} style={styles.logoutButton}>
                  🚪 خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={styles.loginButton}>
                  🔑 دخول
                </Link>
                <Link href="/register" style={styles.registerButton}>
                  📝 أعلن مجاناً
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ✅ البحث والفلاتر */}
      <div style={styles.searchSection}>
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="🔍 ابحث عن سيارة (ماركة، موديل)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            style={styles.filterToggle}
          >
            {showFilters ? '⬆️ إخفاء الفلاتر' : '⬇️ فلاتر متقدمة'}
          </button>
        </div>

        {/* ✅ الفلاتر بشكل أنيق */}
        {showFilters && (
          <div style={styles.filtersContainer}>
            <div style={styles.filtersGrid}>
              {/* الماركة - قائمة منسدلة */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>🏷️ الماركة</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">كل الماركات</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* السعر من */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>💰 السعر من</label>
                <input
                  type="number"
                  placeholder="أقل سعر"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={styles.filterInput}
                />
              </div>

              {/* السعر إلى */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>💰 السعر إلى</label>
                <input
                  type="number"
                  placeholder="أعلى سعر"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={styles.filterInput}
                />
              </div>

              {/* السنة من */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📅 السنة من</label>
                <input
                  type="number"
                  placeholder="من سنة"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  style={styles.filterInput}
                />
              </div>

              {/* السنة إلى */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📅 السنة إلى</label>
                <input
                  type="number"
                  placeholder="إلى سنة"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  style={styles.filterInput}
                />
              </div>

              {/* المشي */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>📊 المشي حتى</label>
                <input
                  type="number"
                  placeholder="أقصى مسافة (كم)"
                  value={maxKilometers}
                  onChange={(e) => setMaxKilometers(e.target.value)}
                  style={styles.filterInput}
                />
              </div>
            </div>

            <button onClick={resetFilters} style={styles.resetButton}>
              🔄 إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* ✅ السيارات */}
      <div style={styles.grid}>
        {cars.length === 0 ? (
          <div style={styles.noCars}>🚫 لا توجد سيارات مطابقة للبحث</div>
        ) : (
          cars.map((car) => (
            <Link href={`/car/${car.id}`} key={car.id} style={styles.cardLink}>
              <div style={styles.card}>
                {car.images && car.images.length > 0 ? (
                  <img src={car.images[0]} alt={car.brand} style={styles.cardImage} />
                ) : (
                  <div style={styles.cardImagePlaceholder}>🚗</div>
                )}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{car.brand} {car.model}</h3>
                  <div style={styles.cardPrice}>
                    {car.price.toLocaleString()} {car.currency === 'SAR' ? 'ر.س' : 'د.ك'}
                  </div>
                  <div style={styles.cardMeta}>
                    {car.year && <span>{car.year}</span>}
                    {car.kilometers && <span>• {car.kilometers.toLocaleString()} كم</span>}
                  </div>
                  <div style={styles.cardStatus}>
                    {car.status === 'approved' ? '✅ متاح' : '💰 مباع'}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  header: { backgroundColor: '#2563eb', color: '#ffffff', padding: '16px 20px' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '10px' },
  headerTitle: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  headerSub: { fontSize: '14px', color: '#bfdbfe', margin: 0 },
  headerButtons: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' as const },
  
  loginButton: { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  registerButton: { padding: '8px 16px', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  newAdButton: { padding: '8px 16px', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  profileButton: { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  logoutButton: { padding: '8px 16px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  
  searchSection: { maxWidth: '900px', margin: '20px auto', padding: '0 20px' },
  searchRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  searchInput: { flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none', backgroundColor: '#ffffff' },
  filterToggle: { padding: '12px 16px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' as const },
  
  filtersContainer: { marginTop: '15px', padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' },
  filtersGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  filterGroup: { display: 'flex', flexDirection: 'column' as const, gap: '5px' },
  filterLabel: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  filterInput: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' },
  filterSelect: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', appearance: 'auto' as const },
  resetButton: { marginTop: '15px', padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#475569', width: '100%' },
  
  grid: { maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  cardLink: { textDecoration: 'none' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s', height: '100%' },
  cardImage: { width: '100%', height: '180px', objectFit: 'cover' as const },
  cardImagePlaceholder: { width: '100%', height: '180px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  cardBody: { padding: '14px' },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' },
  cardPrice: { fontSize: '18px', fontWeight: '800', color: '#16a34a', marginBottom: '4px' },
  cardMeta: { fontSize: '13px', color: '#64748b' },
  cardStatus: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  noCars: { gridColumn: '1 / -1', textAlign: 'center' as const, padding: '60px 20px', color: '#64748b', fontSize: '18px' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
