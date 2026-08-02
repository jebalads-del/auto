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

  // 🔍 متغيرات الفلاتر الذكية والمتتابعة
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxKilometers, setMaxKilometers] = useState('');

  const brands = ['تويوتا', 'هوندا', 'مرسيدس', 'بي إم دبليو', 'أودي', 'فولكس واجن', 'فورد', 'شيفروليه', 'نيسان', 'هيونداي', 'كيا', 'مازدا', 'لكزس', 'جيب', 'رينو', 'بيجو', 'سيات', 'ميتسوبيشي', 'سوبارو', 'فولفو'];

  const modelsMap: Record<string, string[]> = {
    'تويوتا': ['كامري', 'كورولا', 'لاندكروزر', 'برادو', 'أفالون', 'راف فور', 'يارس', 'هيلوكس', 'أخرى'],
    'هوندا': ['أكورد', 'سيفيك', 'سي آر في', 'بايلوت', 'أوديسي', 'سيتي', 'أخرى'],
    'مرسيدس': ['الفئة C', 'الفئة E', 'الفئة S', 'GLC', 'GLE', 'G-Class', 'CLA', 'A-Class', 'أخرى'],
    'بي إم دبليو': ['الفئة الثالثة', 'الفئة الخامسة', 'الفئة السابعة', 'X5', 'X6', 'X3', 'X7', 'أخرى'],
    'أودي': ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8', 'A5', 'أخرى'],
    'فورد': ['تورس', 'موستانج', 'إكسبلورر', 'إكسبيدشن', 'إف 150', 'إيدج', 'فوكس', 'أخرى'],
    'شيفروليه': ['تاهو', 'سيلفرادو', 'كامارو', 'ماليبو', 'كابرس', 'ترافرس', 'كورفيت', 'أخرى'],
    'نيسان': ['باترول', 'ألتيما', 'ماكسيما', 'صني', 'إكس تريل', 'باثفايندر', 'نافارا', 'أخرى'],
    'هيونداي': ['إلنترا', 'سوناتا', 'أكسنت', 'سانتا في', 'توسان', 'أزيرا', 'كريتا', 'أخرى'],
    'كيا': ['أوبتيما', 'سيراتو', 'سبورتج', 'سورينتو', 'ريو', 'K5', 'كادينزا', 'ستنجر', 'أخرى'],
    'لكزس': ['LS', 'LX', 'RX', 'ES', 'IS', 'GX', 'NX', 'أخرى'],
    'جيب': ['جراند شيروكي', 'روبيكون', 'رولنجر', 'شيروكي', 'كومباس', 'أخرى']
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

  // ⚡ تصفية ذكية ومرنة تتجاهل حالة الأحرف الكبيرة والصغيرة لضمان قراءة الموديلات بالشكل الصحيح
  const filteredCars = cars.filter(car => {
    if (car.status !== 'approved' && car.status !== 'sold') return false;
    const matchesBrand = selectedBrand ? car.brand.toLowerCase() === selectedBrand.toLowerCase() : true;
    const matchesModel = selectedModel ? car.model.toLowerCase() === selectedModel.toLowerCase() : true;
    const matchesYear = selectedYear ? car.year.toString() === selectedYear : true;
    const matchesPrice = maxPrice ? car.price <= parseFloat(maxPrice) : true;
    const matchesKm = maxKilometers ? car.kilometers <= parseFloat(maxKilometers) : true;
    return matchesBrand && matchesModel && matchesYear && matchesPrice && matchesKm;
  });

  const activeAdsCount = cars.filter(car => car.status === 'approved').length;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b' }}>جاري تحميل صالة العرض الفاخرة...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 🌟 الواجهة الزرقاء الملكية الأنيقة */}
      <div style={styles.heroSection}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🚕</span>
              <h1 style={styles.headerTitle}>سيارتي</h1>
            </div>
            <div style={styles.headerLinks}>
              <Link href="/login" style={styles.headerLink}>👤 تسجيل الدخول</Link>
            </div>
          </div>
        </header>

        <div style={styles.heroBody}>
          <h2 style={styles.heroMainTitle}>ابحث عن سيارتك المثالية</h2>
          <p style={styles.heroSubTitle}>تصفح آلاف الإعلانات وأرسل إعلانك مجاناً</p>

          {/* 📊 صندوق الإحصائيات الأنيق التفاعلي */}
          <div style={styles.statsContainer}>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>{activeAdsCount}</span>
              <span style={styles.statBoxLabel}>إعلان نشط</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>4</span>
              <span style={styles.statBoxLabel}>مدينة</span>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>3,200</span>
              <span style={styles.statBoxLabel}>من د.ك</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {headerAd && (
          <div style={styles.adBanner}>
            <img src={headerAd.image_url} alt="إعلان تجاري" style={styles.adImage} />
          </div>
        )}

        {/* 🛠️ أزرار التحكم السريعة الفاخرة */}
        <div style={styles.actionButtonsGrid}>
          <Link href="/dashboard/cars/new" style={styles.actionButtonPost}>
            <span style={{ fontSize: '18px' }}>➕</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>أرسل إعلانك</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>مجاناً بالكامل</div>
            </div>
          </Link>

          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)} 
            style={styles.actionButtonSearch}
          >
            <span style={{ fontSize: '18px' }}>🔍</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>بحث متقدم</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>فلترة دقيقة</div>
            </div>
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
  heroSection: { background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', color: 'white', paddingBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  header: { padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  headerLinks: { display: 'flex', alignItems: 'center' },
  headerLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' },
  heroBody: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px 10px 20px', textAlign: 'center' as const },
  heroMainTitle: { fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#38bdf8' },
  heroSubTitle: { fontSize: '14px', color: '#94a3b8', marginBottom: '25px' },
  statsContainer: { display: 'flex', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '15px', maxWidth: '500px', margin: '0 auto', justifyContent: 'space-around', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  statBox: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  statNumber: { fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' },
  statBoxLabel: { fontSize: '11px', color: '#cbd5e1', marginTop: '2px' },
  statDivider: { width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.15)' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  actionButtonsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
  actionButtonPost: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f59e0b', color: '#1e293b', padding: '12px 15px', borderRadius: '14px', textDecoration: 'none', boxShadow: '0 4px 10px rgba(245,158,11,0.2)' },
  actionButtonSearch: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#38bdf8', color: '#1e293b', padding: '12px 15px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontFamily: 'sans-serif', boxShadow: '0 4px 10px rgba(56,189,248,0.2)' },
  searchSection: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '25px', border: '1px solid #e2e8f0' },
  searchGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  filterInput: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', color: '#1e293b', width: '100%', boxSizing: 'border-box' as const },
  clearButton: { marginTop: '12px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  sectionTitle: { fontSize: '18px', color: '#1e293b', marginBottom: '15px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', position: 'relative' as const, display: 'flex', flexDirection: 'column' as const, border: '1px solid #f1f5f9' },
  soldBadge: { position: 'absolute' as const, top: '12px', left: '12px', backgroundColor: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', zIndex: 10 },
  availableBadge: { position: 'absolute' as const, top: '12px', left: '12px', backgroundColor: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', zIndex: 10 },
  gallery: { padding: '10px', backgroundColor: '#f8fafc' },
  imageGrid: { display: 'flex', gap: '6px', overflowX: 'auto' as const, padding: '4px', position: 'relative' as const },
  thumbnail: { width: '110px', height: '80px', objectFit: 'cover' as const, borderRadius: '8px', border: '1px solid #e2e8f0' },
  moreImages: { display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b', padding: '0 8px', fontWeight: 'bold' },
  noImage: { height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' },
  cardBody: { padding: '20px', display: 'flex', flexDirection: 'column' as const, flexGrow: 1 },
  carTitle: { fontSize: '16px', margin: '0 0 8px 0', color: '#0f172a', fontWeight: 'bold' },
  carPrice: { fontSize: '16px', color: '#10b981', fontWeight: 'bold', marginBottom: '10px' },
  carMeta: { display: 'flex', gap: '8px' },
  metaBadge: { fontSize: '11px', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' },
  viewLink: { display: 'block', textAlign: 'center' as const, backgroundColor: '#2563eb', color: 'white', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', marginTop: 'auto' },
  noCars: { textAlign: 'center' as const, padding: '40px 20px', color: '#64748b', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1', width: '100%' },
  adBanner: { margin: '15px 0', textAlign: 'center' as const },
  adImage: { maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '15px', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
