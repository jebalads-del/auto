'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

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
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCars = async () => {
      try {
        let query = supabase
          .from('cars')
          .select('*')
          .eq('status', 'approved')
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
        <h1 style={styles.headerTitle}>🚗 سيارتي</h1>
        <p style={styles.headerSub}>سوق السيارات في الكويت</p>
      </header>

      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="🔍 ابحث عن سيارة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

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
                  <div style={styles.cardPrice}>{car.price.toLocaleString()} {car.currency === 'SAR' ? 'ر.س' : 'د.ك'}</div>
                  <div style={styles.cardMeta}>
                    {car.year && <span>{car.year}</span>}
                    {car.kilometers && <span>• {car.kilometers.toLocaleString()} كم</span>}
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
  header: { backgroundColor: '#2563eb', color: '#ffffff', padding: '40px 20px', textAlign: 'center' as const },
  headerTitle: { fontSize: '32px', fontWeight: 'bold', margin: 0 },
  headerSub: { fontSize: '16px', color: '#bfdbfe', marginTop: '8px' },
  searchSection: { maxWidth: '600px', margin: '20px auto', padding: '0 20px' },
  searchInput: { width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none' },
  grid: { maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  cardLink: { textDecoration: 'none' },
  card: { backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s' },
  cardImage: { width: '100%', height: '200px', objectFit: 'cover' as const },
  cardImagePlaceholder: { width: '100%', height: '200px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' },
  cardBody: { padding: '16px' },
  cardTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' },
  cardPrice: { fontSize: '20px', fontWeight: '800', color: '#16a34a', marginBottom: '8px' },
  cardMeta: { fontSize: '14px', color: '#64748b' },
  noCars: { textAlign: 'center' as const, padding: '60px 20px', color: '#64748b', fontSize: '18px' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
