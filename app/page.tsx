cat << 'EOF' > app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Car {
  id?: number; ID?: number; brand?: string; BRAND?: string;
  model?: string; MODEL?: string; year?: number; YEAR?: number;
  price?: number; PRICE?: number; kilometers?: number; KILOMETERS?: number;
  color?: string; COLOR?: string; description?: string; DESCRIPTION?: string;
  images?: any; IMAGES?: any; status?: string; STATUS?: string; currency?: string; CURRENCY?: string;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carsRes = await fetch('/api/cars', { cache: 'no-store' });
        const carsData = await carsRes.json();
        if (carsData && carsData.success && Array.isArray(carsData.cars)) {
          setCars(carsData.cars);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validCars = Array.isArray(cars) ? cars : [];
EOF
cat << 'EOF' >> app/page.tsx

  const filteredCars = validCars.filter(car => {
    if (!car) return false;
    const carModel = car.model || car.MODEL || '';
    if (!carModel) return false;
    if (!selectedModel) return true;
    return carModel.toLowerCase() === selectedModel.toLowerCase();
  });

  const uniqueModels = validCars.reduce((acc: { brand: string; model: string }[], current) => {
    if (!current) return acc;
    const carModel = current.model || current.MODEL || '';
    const carBrand = current.brand || current.BRAND || '';
    if (!carModel) return acc;
    const x = acc.find(item => item.model.toLowerCase() === carModel.toLowerCase());
    if (!x) acc.push({ brand: carBrand, model: carModel });
    return acc;
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b', marginTop: '15px' }}>جاري تحميل صالة العرض...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}> 🚗 سيارتي</h1>
            <Link href="/login" style={styles.headerLink}>👤 تسجيل الدخول</Link>
          </div>
        </header>
        <div style={styles.heroBody}>
          <h2 style={styles.heroMainTitle}>ابحث عن سيارتك المثالية</h2>
          <p style={styles.heroSubTitle}>تصفح الإعلانات وأرسل إعلانك مجاناً</p>
          <div style={styles.statsContainer}>
            <div style={styles.statsBox}><span style={styles.statNumber}>{validCars.length}</span><span style={styles.statBoxLabel}>إعلان نشط</span></div>
            <div style={styles.statDivider}></div>
            <div style={styles.statsBox}><span style={styles.statNumber}>4</span><span style={styles.statBoxLabel}>مدينة</span></div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.actionButtonsGrid}>
          <Link href="/dashboard/cars/new" style={styles.actionButtonPost}>➕ أرسل إعلانك مجاناً</Link>
          <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)} style={styles.actionButtonSearch}>🔍 اختر موديل السيارة</button>
        </div>

        {isFilterOpen && (
          <div style={styles.searchSection}>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={styles.filterInput}>
              <option value="">عرض كل الماركات والموديلات المتاحة</option>
              {uniqueModels.map((m: any) => (
                <option key={m.model} value={m.model}>{m.brand} - {m.model}</option>
              ))}
            </select>
          </div>
        )}

        <h2 style={styles.sectionTitle}>✨ السيارات المعروضة ({filteredCars.length})</h2>
        {filteredCars.length === 0 ? (
          <div style={styles.noCars}>لا توجد سيارات متوفرة حالياً 🔍</div>
        ) : (
          <div style={styles.grid}>
            {filteredCars.map((car) => {
              if (!car) return null;
              const carId = car.id || car.ID;
              const carBrand = car.brand || car.BRAND || '';
              const carModel = car.model || car.MODEL || '';
              const carPrice = car.price || car.PRICE || 0;
              const carYear = car.year || car.YEAR || '';
              const carCurrency = car.currency || car.CURRENCY || '';
              const carImagesRaw = car.images || car.IMAGES;

              let displaySrc = '';
              if (carImagesRaw) {
                if (Array.isArray(carImagesRaw) && carImagesRaw.length > 0) {
                  const firstArrItem = carImagesRaw[0];
                  if (typeof firstArrItem === 'string') displaySrc = firstArrItem.trim();
                } else if (typeof carImagesRaw === 'string') {
                  const cleanedStr = carImagesRaw.trim();
                  if (cleanedStr.includes(',')) {
                    const splitUrls = cleanedStr.split(',');
                    if (splitUrls.length > 0 && splitUrls[0]) displaySrc = splitUrls[0].trim();
                  } else {
                    displaySrc = cleanedStr;
                  }
                }
              }

              const hasValidImage = displaySrc && (displaySrc.startsWith('http') || displaySrc.startsWith('/'));

              return (
                <div key={carId} style={styles.card}>
                  <div style={styles.gallery}>
                    {hasValidImage ? (
                      <img src={displaySrc} alt={carBrand} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={styles.noImage}>🚗 لا توجد صورة</div>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.carTitle}>{carBrand} {carModel}</h3>
                    <div style={styles.carPrice}>{carPrice.toLocaleString()} {carCurrency === 'SAR' ? 'ر.س' : 'د.ك'}</div>
                    <div style={styles.carMeta}><span style={styles.metaBadge}>📅 {carYear}</span></div>
                    <Link href={`/car/${carId}`} style={styles.viewLink}>عرض التفاصيل ←</Link>
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
EOF
cat << 'EOF' >> app/page.tsx

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  heroSection: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', paddingBottom: '30px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  header: { borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '15px 20px' },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' },
  headerTitle: { fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 },
  headerLink: { fontSize: '14px', color: '#cbd5e1', textDecoration: 'none' },
  heroBody: { textAlign: 'center' as const, padding: '40px 20px 10px 20px', maxWidth: '800px', margin: '0 auto' },
  heroMainTitle: { fontSize: '28px', fontWeight: '800', color: '#38bdf8', marginBottom: '12px' },
  heroSubTitle: { fontSize: '15px', color: '#94a3b8', marginBottom: '30px' },
  statsContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '15px 25px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' },
  statsBox: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '0 20px' },
  statNumber: { fontSize: '22px', fontWeight: 'bold', color: '#fbbf24' },
  statBoxLabel: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },
  statDivider: { width: '1px', height: '35px', backgroundColor: 'rgba(255,255,255,0.1)' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '25px 20px' },
  actionButtonsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' },
  actionButtonPost: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f59e0b', color: '#ffffff', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none' },
  actionButtonSearch: { border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#38bdf8', color: '#ffffff', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold' },
  searchSection: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '25px' },
  filterInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontSize: '14px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' },
  noCars: { textAlign: 'center' as const, padding: '50px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  card: { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  gallery: { position: 'relative' as const, backgroundColor: '#f1f5f9' },
  noImage: { height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' },
  cardBody: { padding: '20px' },
  carTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', marginTop: 0 },
  carPrice: { fontSize: '18px', fontWeight: '800', color: '#10b981', marginBottom: '12px' },
  carMeta: { display: 'flex', gap: '10px', marginBottom: '15px' },
  metaBadge: { fontSize: '12px', backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px' },
  viewLink: { display: 'block', textAlign: 'center' as const, backgroundColor: '#f8fafc', color: '#475569', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', border: '1px solid #e2e8f0' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #38bdf8', borderRadius: '50%' }
};
EOF
