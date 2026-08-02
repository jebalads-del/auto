'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

interface CommercialAd {
  id: number;
  position: string;
  status: string;
  image_url: string;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [ads, setAds] = useState<CommercialAd[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, adsRes] = await Promise.all([
          fetch('/api/cars'),
          fetch('/api/admin/commercial-ads')
        ]);
        const carsData = await carsRes.json();
        const adsData = await adsRes.json();
        if (carsData.success) setCars(carsData.cars);
        if (adsData.success) setAds(adsData.ads);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCurrencySymbol = (currency: string) => {
    if (currency === 'SAR') return 'ر.س';
    return 'د.ك';
  };

  const headerAd = ads.find(ad => ad.position === 'header' && ad.status === 'approved');
  const footerAd = ads.find(ad => ad.position === 'footer' && ad.status === 'approved');

  // تصفية ذكية ومرنة للغاية: تظهر كل السيارات فوراً عند فتح الصفحة وتتغير بفلتر الموديل
  const filteredCars = cars.filter(car => {
    if (!selectedModel) return true;
    return car.model.toLowerCase() === selectedModel.toLowerCase();
  });

  const uniqueModels = Array.from(new Set(cars.map(c => c.model))).filter(Boolean);

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
            <div style={styles.statBox}><span style={styles.statNumber}>{cars.length}</span><span style={styles.statBoxLabel}>إعلان نشط</span></div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}><span style={styles.statNumber}>4</span><span style={styles.statBoxLabel}>مدينة</span></div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {headerAd && <div style={styles.adBanner}><img src={headerAd.image_url} alt="إعلان" style={styles.adImage} /></div>}

        <div style={styles.actionButtonsGrid}>
          <Link href="/dashboard/cars/new" style={styles.actionButtonPost}>➕ أرسل إعلانك مجاناً</Link>
          <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)} style={styles.actionButtonSearch}>🔍 اختر موديل السيارة</button>
        </div>

        {isFilterOpen && (
          <div style={styles.searchSection}>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={styles.filterInput}>
              <option value="">عرض كل الموديلات المتوفرة</option>
              {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        <h2 style={styles.sectionTitle}>✨ السيارات المعروضة ({filteredCars.length})</h2>
        {filteredCars.length === 0 ? (
          <div style={styles.noCars}>لا توجد سيارات متوفرة حالياً 🔍</div>
        ) : (
          <div style={styles.grid}>
            {filteredCars.map((car) => (
              <div key={car.id} style={styles.card}>
                <div style={styles.gallery}>
                  {car.images ? (
                    <img src={car.images[0]} alt={car.brand} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={styles.noImage}>🚗 لا توجد صورة</div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.carTitle}>{car.brand} {car.model}</h3>
                  <div style={styles.carPrice}>{car.price.toLocaleString()} {getCurrencySymbol(car.currency)}</div>
                  <div style={styles.carMeta}><span style={styles.metaBadge}>📅 {car.year}</span></div>
                  <Link href={`/car/${car.id}`} style={styles.viewLink}>عرض التفاصيل ←</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {footerAd && <div style={styles.adBanner}><img src={footerAd.image_url} alt="إعلان" style={styles.adImage} /></div>}
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
  actionButtonPost: { display: 'block', textAlign: 'center' as const, backgroundColor: '#f59e0b', color: '#1e293b', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' },
  actionButtonSearch: { backgroundColor: '#38bdf8', color: '#1e293b', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  searchSection: { backgroundColor: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' },
  filterInput: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', color: '#1e293b', backgroundColor: '#f8fafc' },
  sectionTitle: { fontSize: '16px', color: '#1e293b', marginBottom: '12px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' },
  card: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9' },
  gallery: { padding: '8px', backgroundColor: '#f8fafc' },
  noImage: { height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' },
  cardBody: { padding: '12px' },
  carTitle: { fontSize: '15px', margin: '0 0 5px 0', color: '#0f172a', fontWeight: 'bold' },
  carPrice: { fontSize: '15px', color: '#10b981', fontWeight: 'bold', marginBottom: '8px' },
  carMeta: { display: 'flex', marginBottom: '10px' },
  metaBadge: { fontSize: '11px', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' },
  viewLink: { display: 'block', textAlign: 'center' as const, backgroundColor: '#2563eb', color: 'white', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' },
  noCars: { textAlign: 'center' as const, padding: '30px 10px', color: '#64748b', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' },
  adBanner: { margin: '10px 0', textAlign: 'center' as const },
  adImage: { maxWidth: '100%', height: 'auto', borderRadius: '8px' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '10px' },
  spinner: { width: '35px', height: '35px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
