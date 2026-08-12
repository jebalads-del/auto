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
  images: any; 
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
        if (carsData && carsData.success && Array.isArray(carsData.cars)) setCars(carsData.cars);
        if (adsData && adsData.success && Array.isArray(adsData.ads)) setAds(adsData.ads);
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

  const approvedAds = Array.isArray(ads) ? ads : [];
  const headerAd = approvedAds.find(ad => ad.position === 'header' && ad.status === 'approved');
  const footerAd = approvedAds.find(ad => ad.position === 'footer' && ad.status === 'approved');

  const validCars = Array.isArray(cars) ? cars : [];
  const filteredCars = validCars.filter(car => {
    if (!car || !car.model) return false;
    if (!selectedModel) return true;
    return car.model.toLowerCase() === selectedModel.toLowerCase();
  });

  const uniqueModels = validCars.reduce((acc: { brand: string; model: string }[], current) => {
    if (!current || !current.model) return acc;
    const x = acc.find(item => item.model.toLowerCase() === current.model.toLowerCase());
    if (!x) {
      acc.push({ brand: current.brand || '', model: current.model });
    }
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
            <h1 style={styles.headerTitle}>🚗 سيارتي</h1>
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
        {headerAd && headerAd.image_url && typeof headerAd.image_url === 'string' && (
          <div style={styles.adBanner}>
            <img src={headerAd.image_url} alt="إعلان" style={styles.adImage} />
          </div>
        )}

        <div style={styles.actionButtonsGrid}>
          <Link href="/dashboard/cars/new" style={styles.actionButtonPost}>➕ أرسل إعلانك مجاناً</Link>
          <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)} style={styles.actionButtonSearch}>🔍 اختر موديل السيارة</button>
        </div>

        {isFilterOpen && (
          <div style={styles.searchSection}>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={styles.filterInput}>
              <option value="">عرض كل الماركات والموديلات المتاحة</option>
              {uniqueModels.map((m: any) => (
                <option key={m.model} value={m.model}>
                  {m.brand} - {m.model}
                </option>
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
              
              // التفكيك والفرز الذكي لاستخراج أول صورة صالحة حية بشكل محمي
              let displaySrc = '';
              if (car.images) {
                if (Array.isArray(car.images) && car.images.length > 0) {
                  displaySrc = car.images[0];
                } else if (typeof car.images === 'string') {
                  const cleanedStr = car.images.trim();
                  // إذا كانت مصفوفة نصوص مدمجة ومفصولة بفاصلة
                  if (cleanedStr.includes(',')) {
                    const splitUrls = cleanedStr.split(',');
                    if (splitUrls.length > 0) displaySrc = splitUrls[0].trim(); // تم الإصلاح هنا يا بطل!
                  } else {
                    displaySrc = cleanedStr;
                  }
                }
              }

              // التوثق من المسارات والامتدادات
              const hasValidImage = displaySrc && (displaySrc.startsWith('http') || displaySrc.startsWith('/'));

              return (
                <div key={car.id} style={styles.card}>
                  <div style={styles.gallery}>
                    {hasValidImage ? (
                      <img 
                        src={displaySrc} 
                        alt={car.brand || 'Car'} 
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                    ) : (
                      <div style={styles.noImage}>🚗 لا توجد صورة</div>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <h3 style={styles.carTitle}>{car.brand || ''} {car.model || ''}</h3>
                    <div style={styles.carPrice}>{(car.price || 0).toLocaleString()} {getCurrencySymbol(car.currency || '')}</div>
                    <div style={styles.carMeta}><span style={styles.metaBadge}>📅 {car.year || ''}</span></div>
                    <Link href={`/car/${car.id}`} style={styles.viewLink}>عرض التفاصيل ←</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {footerAd && footerAd.image_url && typeof footerAd.image_url === 'string' && (
          <div style={styles.adBanner}>
            <img src={footerAd.image_url} alt="إعلان" style={styles.adImage} />
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
  statsBox: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
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
  card: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const },
  gallery: { backgroundColor: '#f1f5f9', width: '100%', height: '160px' },
  noImage: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8', fontSize: '13px' },
  cardBody: { padding: '15px', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  carTitle: { margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1e293b' },
  carPrice: { fontSize: '16px', fontWeight: 'bold', color: '#10b981' },
  carMeta: { display: 'flex', gap: '8px' },
  metaBadge: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '4px 8px', borderRadius: '6px' },
  viewLink: { display: 'block', textAlign: 'center' as const, marginTop: '5px', color: '#2563eb', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' },
  adBanner: { width: '100%', backgroundColor: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', display: 'flex', justifyContent: 'center' },
  adImage: { maxWidth: '100%', height: 'auto', display: 'block' },
  noCars: { textAlign: 'center' as const, padding: '40px', color: '#64748b', fontSize: '14px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%' }
};
