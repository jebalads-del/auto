'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  kilometers: number;
  color: string;
  description: string;
  images: string[];
  status: string;
  currency: string;
}

export default function HomePage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carsRes = await fetch(`/api/cars?t=${Date.now()}`).catch(() => null);
        const carsData = carsRes ? await carsRes.json().catch(() => null) : null;
        if (carsData) {
          if (Array.isArray(carsData)) setCars(carsData);
          else if (Array.isArray(carsData.cars)) setCars(carsData.cars);
          else if (carsData.success && Array.isArray(carsData.cars)) setCars(carsData.cars);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePostAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('user') || document.cookie.includes('session');
    if (!token) {
      alert('🔒 عذراً، يجب عليك تسجيل الدخول أولاً لتتمكن من إضافة ونشر إعلانك!');
      router.push('/login');
    } else {
      router.push('/dashboard/cars/new');
    }
  };
  const getCurrencySymbol = (currency: string) => {
    if (!currency) return 'د.ك';
    if (String(currency).toUpperCase() === 'SAR') return 'ر.س';
    return 'د.ك';
  };

  const filteredCars = Array.isArray(cars) ? cars.filter(car => {
    if (!car || !car.model) return false;
    if (!selectedModel) return true;
    return String(car.model).toLowerCase() === selectedModel.toLowerCase();
  }) : [];

  const uniqueModels = Array.isArray(cars) ? cars.reduce((acc: { brand: string; model: string }[], current) => {
    if (!current || !current.model) return acc;
    const x = acc.find(item => String(item.model).toLowerCase() === String(current.model).toLowerCase());
    if (!x) acc.push({ brand: current.brand || '', model: current.model });
    return acc;
  }, []) : [];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b' }}>جاري تحميل صالة العرض...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>🚗 سيارتي</h1>
            <Link href="/login" style={styles.headerLink}>👤 تسجيل الدخول</Link>
          </div>
        </header>
        <div style={styles.heroBody}>
          <h2 style={styles.heroMainTitle}>ابحث عن سيارتك المثالية</h2>
          <p style={styles.heroSubTitle}>تصفح الإعلانات وأرسل إعلانك مجاناً</p>
          <div style={styles.statsContainer}>
            <div style={styles.statBox}><span style={styles.statNumber}>{filteredCars.length}</span><span style={styles.statBoxLabel}>إعلان نشط</span></div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}><span style={styles.statNumber}>4</span><span style={styles.statBoxLabel}>مدينة</span></div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.actionButtonsGrid}>
          <button type="button" onClick={handlePostAdClick} style={styles.actionButtonPost}>➕ أرسل إعلانك مجاناً</button>
          <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)} style={styles.actionButtonSearch}>🔍 اختر موديل السيارة</button>
        </div>

        {isFilterOpen && (
          <div style={styles.searchSection}>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={styles.filterInput}>
              <option value="">عرض كل الماركات والموديلات المتاحة</option>
              {uniqueModels.map((m: any, idx: number) => (
                <option key={m.model ? m.model + idx : idx} value={m.model || ''}>
                  {m.brand} {m.brand && m.model ? '-' : ''} {m.model}
                </option>
              ))}
            </select>
          </div>
        )}

        <h2 style={styles.sectionTitle}>✨ السيارات المعروضة ({filteredCars.length})</h2>
        {filteredCars.length === 0 ? (
          <div style={styles.noCars}>لا توجد سيارات معتمدة متوفرة حالياً بالواجهة 🔍</div>
        ) : (
          <div style={styles.grid}>
            {filteredCars.map((car) => {
              if (!car) return null;
              const carBrand = car.brand || 'سيارة';
              const carModel = car.model || '';
              const carYear = car.year || '----';
              const carPrice = car.price ? car.price.toLocaleString() : '0';
              const carCurrency = getCurrencySymbol(car.currency);
              const carImageSrc = car.images ? String(car.images) : '';

              return (
                <div key={car.id || Math.random()} style={styles.card}>
                  <div style={styles.gallery}>
                    {carImageSrc && carImageSrc.trim() !== '' ? (
                      <img src={carImageSrc} alt={carBrand} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={styles.noImage}>🚗 لا توجد صورة</div>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.carTitle}>{carBrand} {carModel}</h3>
                    <div style={styles.carPrice}>{carPrice} {carCurrency}</div>
                    <div style={styles.carMeta}><span style={styles.metaBadge}>📅 {carYear}</span></div>
                    <Link href={`/car/${car.id || ''}`} style={styles.viewLink}>عرض التفاصيل ←</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  heroSection: { background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', color: 'white', paddingBottom: '25px' },
  header: { padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', margin: 0, fontSize: '18px', fontWeight: 'bold' },
  headerLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '13px' },
  heroBody: { maxWidth: '1200px', margin: '0 auto', padding: '20px', textAlign: 'center' as const },
  heroMainTitle: { fontSize: '24px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 5px 0' },
  heroSubTitle: { fontSize: '13px', color: '#94a3b8', margin: '0 0 15px 0' },
  statsContainer: { display: 'flex', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px', maxWidth: '400px', margin: '0 auto', justifyContent: 'space-around' },
  statBox: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  statNumber: { fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' },
  statBoxLabel: { fontSize: '11px', color: '#cbd5e1' },
  statDivider: { width: '1px', height: '25px', backgroundColor: 'rgba(255,255,255,0.15)' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '15px' },
  actionButtonsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
  actionButtonPost: { display: 'block', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' as const, backgroundColor: '#f59e0b', color: '#1e293b', padding: '12px', borderRadius: '10px', fontWeight: 'bold' as const, fontSize: '13px' },
  actionButtonSearch: { backgroundColor: '#38bdf8', color: '#1e293b', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '13px' },
  searchSection: { backgroundColor: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  filterInput: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', outline: 'none' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' },
  noCars: { textAlign: 'center' as const, padding: '40px', backgroundColor: 'white', borderRadius: '12px', color: '#64748b', border: '1px dashed #cbd5e1' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' },
  card: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' },
  gallery: { position: 'relative' as const, backgroundColor: '#f1f5f9' },
  noImage: { height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' },
  cardBody: { padding: '12px' },
  carTitle: { fontSize: '15px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 5px 0' },
  carPrice: { fontSize: '16px', fontWeight: 'bold', color: '#059669', margin: '0 0 8px 0' },
  carMeta: { display: 'flex', gap: '8px', marginBottom: '12px' },
  metaBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' },
  viewLink: { display: 'block', textAlign: 'center' as const, backgroundColor: '#1e3a8a', color: 'white', padding: '8px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' as const },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '12px' },
  spinner: { width: '35px', height: '35px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

