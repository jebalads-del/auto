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
  created_at: string;
  currency: string;
}

interface CommercialAd {
  id: number;
  user_id: number;
  position: string;
  status: string;
  price: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  image_url: string;
}

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [ads, setAds] = useState<CommercialAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, adsRes] = await Promise.all([
          fetch('/api/car'),
          fetch('/api/admin/commercial-ads')
        ]);
        
        const carsData = await carsRes.json();
        const adsData = await adsRes.json();

        if (carsData.success) setCars(carsData.cars);
        if (adsData.success) setAds(adsData.ads);
      } catch (error) {
        console.error("خطأ أثناء جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'KWD': return 'د.ك';
      case 'SAR': return 'ر.س';
      case 'AED': return 'د.إ';
      case 'QAR': return 'ر.ق';
      case 'BHD': return 'د.ب';
      case 'OMR': return 'ر.ع';
      default: return '';
    }
  };

  const headerAd = ads.find(ad => ad.position === 'header' && ad.status === 'approved');
  const footerAd = ads.find(ad => ad.position === 'footer' && ad.status === 'approved');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>جاري تحميل السيارات والعروض...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>🚗 سيارتي</h1>
          <div style={styles.headerLinks}>
            <Link href="/login" style={styles.headerLink}>دخول</Link>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {headerAd && (
          <div style={styles.adBanner}>
            <img src={headerAd.image_url} alt="إعلان تجاري" style={styles.adImage} loading="lazy" />
          </div>
        )}

        <h2 style={styles.sectionTitle}>✨ السيارات المعروضة</h2>
        
        {cars.length === 0 ? (
          <div style={styles.noCars}>لا توجد سيارات متاحة حالياً</div>
        ) : (
          <div style={styles.grid}>
            {cars.filter(c => c.status === 'approved' || c.status === 'sold').map((car) => (
              <div key={car.id} style={styles.card}>
                {car.status === 'sold' && (
                  <div style={styles.soldBadge}>🔒 مباع</div>
                )}
                <div style={styles.gallery}>
                  {car.images && car.images.length > 0 ? (
                    <div style={styles.imageGrid}>
                      {car.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${car.brand} ${car.model}`}
                          loading="lazy"
                          style={styles.thumbnail}
                        />
                      ))}
                      {car.images.length > 3 && (
                        <span style={styles.moreImages}>+{car.images.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <div style={styles.noImage}>🚗 لا توجد صور</div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.carTitle}>{car.brand} {car.model}</h3>
                  <div style={styles.carPrice}>
                    {getCurrencySymbol(car.currency)} {car.price.toLocaleString()}
                  </div>
                  <div style={styles.carMeta}>
                    <span>📅 {car.year}</span>
                    <span>📏 {car.kilometers?.toLocaleString() || 0} كم</span>
                  </div>
                  <Link href={`/car/${car.id}`} style={styles.viewLink}>
                    التفاصيل ←
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {footerAd && (
          <div style={styles.adBanner}>
            <img src={footerAd.image_url} alt="إعلان تجاري" style={styles.adImage} loading="lazy" />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  header: { backgroundColor: '#1e293b', padding: '15px 20px', color: 'white' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#38bdf8', margin: 0, fontSize: '20px' },
  headerLinks: { display: 'flex', gap: '15px' },
  headerLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  sectionTitle: { fontSize: '22px', color: '#1e293b', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'relative' as const, display: 'flex', flexDirection: 'column' as const },
  soldBadge: { position: 'absolute' as const, top: '10px', left: '10px', backgroundColor: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 },
  gallery: { padding: '10px', backgroundColor: '#f1f5f9' },
  imageGrid: { display: 'flex', gap: '5px', overflowX: 'auto' as const, padding: '5px', position: 'relative' as const },
  thumbnail: { width: '100px', height: '70px', objectFit: 'cover' as const, borderRadius: '6px', border: '1px solid #e2e8f0' },
  moreImages: { display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b', padding: '0 10px', fontWeight: 'bold' },
  noImage: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' },
  cardBody: { padding: '15px', display: 'flex', flexDirection: 'column' as const, flexGrow: 1 },
  carTitle: { fontSize: '16px', margin: '0 0 8px 0', color: '#1e293b' },
  carPrice: { fontSize: '18px', color: '#10b981', fontWeight: 'bold', marginBottom: '10px' },
  carMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '15px' },
  viewLink: { display: 'block', textAlign: 'center' as const, backgroundColor: '#2563eb', color: 'white', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', marginTop: 'auto' },
  noCars: { textAlign: 'center' as const, padding: '40px', color: '#64748b' },
  adBanner: { margin: '20px 0', textAlign: 'center' as const },
  adImage: { maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '70vh', gap: '15px' },
  spinner: { width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
