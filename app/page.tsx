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

  // 🔍 فلاتر البحث الذكية والمتتابعة
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxKilometers, setMaxKilometers] = useState('');

  const brands = ['تويوتا', 'هوندا', 'مرسيدس', 'بي إم دبليو', 'أودي', 'فولكس واجن', 'فورد', 'شيفروليه', 'نيسان', 'هيونداي', 'كيا', 'مازدا', 'لكزس', 'جيب', 'رينو', 'بيجو', 'سيات', 'ميتسوبيشي', 'سوبارو', 'فولفو'];

  const modelsMap: Record<string, string[]> = {
    'تويوتا': ['كامري', 'كورولا', 'لاندكروزر', 'برادو', 'أفالون', 'راف فور', 'يارس', 'هيلوكس'],
    'هوندا': ['أكورد', 'سيفيك', 'سي آر في', 'بايلوت', 'أوديسي', 'سيتي'],
    'مرسيدس': ['الفئة C', 'الفئة E', 'الفئة S', 'GLC', 'GLE', 'G-Class', 'CLA', 'A-Class'],
    'بي إم دبليو': ['الفئة الثالثة', 'الفئة الخامسة', 'الفئة السابعة', 'X5', 'X6', 'X3', 'X7'],
    'أودي': ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8', 'A5'],
    'فورد': ['تورس', 'موستانج', 'إكسبلورر', 'إكسبيدشن', 'إف 150', 'إيدج', 'فوكس'],
    'شيفروليه': ['تاهو', 'سيلفرادو', 'كامارو', 'ماليبو', 'كابرس', 'ترافرس', 'كورفيت'],
    'نيسان': ['باترول', 'ألتيما', 'ماكسيما', 'صني', 'إكس تريل', 'باثفايندر', 'نافارا'],
    'هيونداي': ['إلنترا', 'سوناتا', 'أكسنت', 'سانتا في', 'توسان', 'أزيرا', 'كريتا'],
    'كيا': ['أوبتيما', 'سيراتو', 'سبورتج', 'سورينتو', 'ريو', 'K5', 'كادينزا', 'ستنجر'],
    'لكزس': ['LS', 'LX', 'RX', 'ES', 'IS', 'GX', 'NX'],
    'جيب': ['جراند شيروكي', 'روبيكون', 'رولنجر', 'شيروكي', 'كومباس']
  };

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
        console.error("Error fetching data:", error);
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
      default: return currency || '';
    }
  };

  const headerAd = ads.find(ad => ad.position === 'header' && ad.status === 'approved');
  const footerAd = ads.find(ad => ad.position === 'footer' && ad.status === 'approved');

  const filteredCars = cars.filter(car => {
    if (car.status !== 'approved' && car.status !== 'sold') return false;
    const matchesBrand = selectedBrand ? car.brand === selectedBrand : true;
    const matchesModel = selectedModel ? car.model === selectedModel : true;
    const matchesYear = selectedYear ? car.year.toString() === selectedYear : true;
    const matchesPrice = maxPrice ? car.price <= parseFloat(maxPrice) : true;
    const matchesKm = maxKilometers ? car.kilometers <= parseFloat(maxKilometers) : true;
    return matchesBrand && matchesModel && matchesYear && matchesPrice && matchesKm;
  });

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
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>🚗 سيارتي <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>الفخامة والسهولة</span></h1>
          <div style={styles.headerLinks}>
            <Link href="/dashboard/cars/new" style={styles.headerLinkActive}>➕ أضف سيارتك</Link>
            <Link href="/login" style={styles.headerLink}>دخول الأدمن</Link>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {headerAd && (
          <div style={styles.adBanner}>
            <img src={headerAd.image_url} alt="إعلان تجاري" style={styles.adImage} />
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            style={{ width: '100%', padding: '12px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '14px' }}
          >
            {isFilterOpen ? '🔼 إخفاء صندوق البحث المتقدم' : '🔍 اضغط هنا للبحث المتقدم وتصفية السيارات'}
          </button>
        </div>

        {isFilterOpen && (
          <div style={styles.searchSection}>
            <div style={styles.searchGrid}>
              <select value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); }} style={styles.filterInput}>
                <option value="">اختر الماركة</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={styles.filterInput} disabled={!selectedBrand}>
                <option value="">{selectedBrand ? 'اختر الموديل' : 'اختر الماركة أولاً'}</option>
                {selectedBrand && (modelsMap[selectedBrand] || []).map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={styles.filterInput}>
                <option value="">كل السنوات</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <input type="number" placeholder="الحد الأقصى للسعر" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={styles.filterInput} />
              <input type="number" placeholder="الحد الأقصى للممشى (كم)" value={maxKilometers} onChange={(e) => setMaxKilometers(e.target.value)} style={styles.filterInput} />
            </div>
            {(selectedBrand || selectedModel || selectedYear || maxPrice || maxKilometers) && (
              <button 
                type="button"
                onClick={() => { setSelectedBrand(''); setSelectedModel(''); setSelectedYear(''); setMaxPrice(''); setMaxKilometers(''); }}
                style={styles.clearButton}
              >
                🔄 إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        )}
        <h2 style={styles.sectionTitle}>✨ السيارات المعروضة ({filteredCars.length})</h2>
        
        {filteredCars.length === 0 ? (
          <div style={styles.noCars}>لا توجد سيارات تطابق معايير البحث الحالية 🔍</div>
        ) : (
          <div style={styles.grid}>
            {filteredCars.map((car) => (
              <div key={car.id} style={styles.card}>
                {car.status === 'sold' ? (
                  <div style={styles.soldBadge}>🔒 مباع</div>
                ) : (
                  <div style={styles.availableBadge}>✨ متاح</div>
                )}
                
                <div style={styles.gallery}>
                  {car.images && car.images.length > 0 ? (
                    <div style={styles.imageGrid}>
                      {car.images.slice(0, 3).map((img, idx) => (
                        <img key={idx} src={img} alt={car.brand} style={styles.thumbnail} loading="lazy" />
                      ))}
                      {car.images.length > 3 && (
                        <span style={styles.moreImages}>+{car.images.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <div style={styles.noImage}>🚗 لا توجد صور متوفرة</div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.carTitle}>{car.brand} {car.model}</h3>
                  <div style={styles.carPrice}>
                    <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748b' }}>السعر: </span>
                    {car.price.toLocaleString()} {getCurrencySymbol(car.currency)}
                  </div>
                  <div style={styles.carMeta}>
                    <span style={styles.metaBadge}>📅 {car.year}</span>
                    <span style={styles.metaBadge}>📏 {car.kilometers?.toLocaleString() || 0} كم</span>
                  </div>
                  <Link href={`/car/${car.id}`} style={styles.viewLink}>
                    عرض التفاصيل والتواصل ←
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {footerAd && (
          <div style={styles.adBanner}>
            <img src={footerAd.image_url} alt="إعلان تجاري" style={styles.adImage} />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  header: { backgroundColor: '#0f172a', padding: '18px 20px', color: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#38bdf8', margin: 0, fontSize: '22px', fontWeight: 'bold' },
  headerLinks: { display: 'flex', gap: '12px', alignItems: 'center' },
  headerLink: { color: '#94a3b8', textDecoration: 'none', fontSize: '13px' },
  headerLinkActive: { backgroundColor: '#38bdf8', color: '#0f172a', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '25px 20px' },
  searchSection: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '30px', border: '1px solid #e2e8f0' },
  searchGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  filterInput: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', color: '#1e293b' },
  clearButton: { marginTop: '12px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  sectionTitle: { fontSize: '20px', color: '#1e293b', marginBottom: '20px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' },
  card: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative' as const, display: 'flex', flexDirection: 'column' as const, border: '1px solid #f1f5f9' },
  soldBadge: { position: 'absolute' as const, top: '12px', left: '12px', backgroundColor: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', zIndex: 10 },
  availableBadge: { position: 'absolute' as const, top: '12px', left: '12px', backgroundColor: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', zIndex: 10 },
  gallery: { padding: '12px', backgroundColor: '#f8fafc' },
  imageGrid: { display: 'flex', gap: '6px', overflowX: 'auto' as const, padding: '4px', position: 'relative' as const },
  thumbnail: { width: '110px', height: '80px', objectFit: 'cover' as const, borderRadius: '8px', border: '1px solid #e2e8f0' },
  moreImages: { display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b', padding: '0 8px', fontWeight: 'bold' },
  noImage: { height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' },
  cardBody: { padding: '20px', display: 'flex', flexDirection: 'column' as const, flexGrow: 1 },
  carTitle: { fontSize: '18px', margin: '0 0 10px 0', color: '#0f172a', fontWeight: 'bold' },
  carPrice: { fontSize: '18px', color: '#10b981', fontWeight: 'bold', marginBottom: '12px' },
  carMeta: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginBottom: '20px' },
  metaBadge: { fontSize: '12px', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' },
  viewLink: { display: 'block', textAlign: 'center' as const, backgroundColor: '#2563eb', color: 'white', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', marginTop: 'auto' },
  noCars: { textAlign: 'center' as const, padding: '50px 20px', color: '#64748b', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' },
  adBanner: { margin: '15px 0 25px 0', textAlign: 'center' as const },
  adImage: { maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '15px', backgroundColor: '#f8fafc' },
  spinner: { width: '45px', height: '45px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
