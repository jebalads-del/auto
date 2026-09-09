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
  const [user, setUser] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ جلب المستخدم الحالي
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // ✅ جلب السيارات
  useEffect(() => {
    const fetchCars = async () => {
      try {
        let query = supabase
          .from('cars')
          .select('*')
          .in('status', ['approved', 'sold'])
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
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
  }, [searchTerm]);

  // ✅ تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
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
      {/* ✅ الهيدر مع الأزرار */}
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
                  📝 تسجيل
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ✅ البحث */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="🔍 ابحث عن سيارة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* ✅ السيارات - عمودين */}
      <div style={styles.grid}>
        {cars.length === 0 ? (
          <div style={styles.noCars}>🚫 لا توجد سيارات للعرض</div>
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
  
  // ✅ الهيدر
  header: { backgroundColor: '#2563eb', color: '#ffffff', padding: '16px 20px' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '10px' },
  headerTitle: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  headerSub: { fontSize: '14px', color: '#bfdbfe', margin: 0 },
  headerButtons: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' as const },
  
  // ✅ الأزرار
  loginButton: { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  registerButton: { padding: '8px 16px', backgroundColor: '#ffffff', color: '#2563eb', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  newAdButton: { padding: '8px 16px', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  profileButton: { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  logoutButton: { padding: '8px 16px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  
  // ✅ البحث
  searchSection: { maxWidth: '600px', margin: '20px auto', padding: '0 20px' },
  searchInput: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none', backgroundColor: '#ffffff' },
  
  // ✅ الشبكة - عمودين
  grid: { maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  
  // ✅ البطاقات
  cardLink: { textDecoration: 'none' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' },
  cardImage: { width: '100%', height: '180px', objectFit: 'cover' as const },
  cardImagePlaceholder: { width: '100%', height: '180px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' },
  cardBody: { padding: '14px' },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' },
  cardPrice: { fontSize: '18px', fontWeight: '800', color: '#16a34a', marginBottom: '4px' },
  cardMeta: { fontSize: '13px', color: '#64748b' },
  cardStatus: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  
  // ✅ حالة عدم وجود سيارات
  noCars: { gridColumn: '1 / -1', textAlign: 'center' as const, padding: '60px 20px', color: '#64748b', fontSize: '18px' },
  
  // ✅ تحميل
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
