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
  images: string | string[];
  image_url?: string;
  status: string;
  currency: string;
}

export default function HomePage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات محرك البحث
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchBrand, setSearchBrand] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 [HOME] جلب السيارات...');
        const carsRes = await fetch(`/api/cars?t=${Date.now()}`);
        
        if (carsRes.ok) {
          const data = await carsRes.json();
          console.log('✅ [HOME] البيانات المستلمة:', data);
          
          let carsList: Car[] = [];
          if (data.success && Array.isArray(data.cars)) {
            carsList = data.cars;
          } else if (Array.isArray(data)) {
            carsList = data;
          } else if (data.cars && Array.isArray(data.cars)) {
            carsList = data.cars;
          }
          
          // تصفية السيارات المقبولة فقط
          const approvedCars = carsList.filter(car => car.status === 'approved' || car.status === 'active');
          setCars(approvedCars);
          console.log(`✅ [HOME] تم جلب ${approvedCars.length} سيارة مقبولة`);
        } else {
          console.error('❌ [HOME] فشل في جلب البيانات');
        }
      } catch (error) {
        console.error('❌ [HOME ERROR]:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePostAdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('user');
    if (!token) {
      router.push('/login');
    } else {
      router.push('/dashboard/cars/new');
    }
  };

  const getCurrencySymbol = (currency: string) => {
    if (!currency) return 'د.ك';
    if (String(currency).toUpperCase() === 'SAR') return 'ر.س';
    if (String(currency).toUpperCase() === 'KWD') return 'د.ك';
    return 'د.ك';
  };

  // فلترة السيارات
  const filteredCars = Array.isArray(cars) ? cars.filter(car => {
    if (!car) return false;
    
    if (searchBrand && String(car.brand).toLowerCase() !== searchBrand.toLowerCase()) return false;
    if (searchModel && String(car.model).toLowerCase() !== searchModel.toLowerCase()) return false;
    if (maxPrice && Number(car.price) > Number(maxPrice)) return false;
    if (minYear && Number(car.year) < Number(minYear)) return false;
    
    return true;
  }) : [];

  // جلب الماركات الفريدة
  const uniqueBrands = Array.isArray(cars) ? Array.from(new Set(cars.map(car => car?.brand).filter(Boolean))) : [];

  // جلب الموديلات حسب الماركة
  const availableModels = Array.isArray(cars) && searchBrand 
    ? Array.from(new Set(cars.filter(car => car && String(car.brand).toLowerCase() === searchBrand.toLowerCase()).map(car => car.model).filter(Boolean)))
    : [];

  // دالة معالجة الصور
  const getCarImage = (car: Car): string => {
    try {
      // 1. استخدام image_url مباشرة إذا كان موجوداً
      if (car.image_url && car.image_url.startsWith('http')) {
        console.log('✅ Using image_url:', car.image_url);
        return car.image_url;
      }
      
      // 2. معالجة حقل images
      if (car.images) {
        let imagesArray: string[] = [];
        if (typeof car.images === 'string') {
          const cleanImgs = car.images.trim();
          if (cleanImgs.startsWith('[') && cleanImgs.endsWith(']')) {
            imagesArray = JSON.parse(cleanImgs);
          } else if (cleanImgs.startsWith('http')) {
            return cleanImgs;
          } else {
            imagesArray = cleanImgs.split(',').map(url => url.trim()).filter(Boolean);
          }
        } else if (Array.isArray(car.images)) {
          imagesArray = car.images;
        }
        
        if (imagesArray.length > 0 && imagesArray[0]) {
          console.log('✅ Using images[0]:', imagesArray[0]);
          return imagesArray[0];
        }
      }
      
      console.log('⚠️ No image found, using default');
      return '/default-car.jpg';
    } catch (e) {
      console.error('❌ Image parsing error:', e);
      return '/default-car.jpg';
    }
  };

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
          <p style={styles.heroSubTitle}>تصفح الإعلانات الموثوقة المعروضة الآن في السوق</p>
          <div style={styles.statsContainer}>
            <div style={styles.statBox}><span style={styles.statNumber}>{filteredCars.length}</span><span style={styles.statBoxLabel}>إعلان مطابق</span></div>
            <div style={styles.statDivider}></div>
            <div style={styles.statBox}><span style={styles.statNumber}>4</span><span style={styles.statBoxLabel}>مدينة</span></div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.actionButtonsGrid}>
          <button type="button" onClick={handlePostAdClick} style={styles.actionButtonPost}>➕ أرسل إعلانك مجاناً</button>
          <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)} style={styles.actionButtonSearch}>🔍 {isFilterOpen ? 'إغلاق محرك البحث' : 'تخصيص فلاتر البحث'}</button>
        </div>

        {isFilterOpen && (
          <div style={styles.searchSection}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#1e293b', fontWeight: 'bold' }}>⚙️ خيارات البحث المتقدم:</h3>
            <div style={styles.filterGrid}>
              
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>الماركة (الشركة المصنعة):</label>
                <select value={searchBrand} onChange={(e) => { setSearchBrand(e.target.value); setSearchModel(''); }} style={styles.filterInput}>
                  <option value="">كل الماركات</option>
                  {uniqueBrands.map((brand, idx) => <option key={idx} value={brand}>{brand}</option>)}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>الموديل:</label>
                <select value={searchModel} onChange={(e) => setSearchModel(e.target.value)} disabled={!searchBrand} style={{...styles.filterInput, opacity: searchBrand ? 1 : 0.6}}>
                  <option value="">كل الموديلات</option>
                  {availableModels.map((model, idx) => <option key={idx} value={model}>{model}</option>)}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>السعر الأقصى (د.ك):</label>
                <input type="number" placeholder="مثال: 5000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={styles.filterInput} />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>سنة الصنع (من سنة):</label>
                <input type="number" placeholder="مثال: 2018" value={minYear} onChange={(e) => setMinYear(e.target.value)} style={styles.filterInput} />
              </div>

            </div>
            
            {(searchBrand || searchModel || maxPrice || minYear) && (
              <button type="button" onClick={() => { setSearchBrand(''); setSearchModel(''); setMaxPrice(''); setMinYear(''); }} style={styles.resetButton}>🧹 مسح كل الفلاتر وعرض الكل</button>
            )}
          </div>
        )}

        <h2 style={styles.sectionTitle}>✨ السيارات المعروضة ({filteredCars.length})</h2>
        {filteredCars.length === 0 ? (
          <div style={styles.noCars}>لم نجد أي سيارات تطابق خيارات البحث الحالية. جرب تغيير الفلاتر 🔍</div>
        ) : (
          <div style={styles.grid}>
            {filteredCars.map((car) => {
              if (!car) return null;
              const carBrand = car.brand || 'سيارة';
              const carModel = car.model || '';
              const carYear = car.year || '----';
              const carPrice = car.price ? car.price.toLocaleString() : '0';
              const carCurrency = getCurrencySymbol(car.currency);
              const carImageSrc = getCarImage(car);

              return (
                <div key={car.id || Math.random()} style={styles.card}>
                  <div style={styles.gallery}>
                    {carImageSrc && carImageSrc.trim() !== '' && carImageSrc !== '/default-car.jpg' ? (
                      <img 
                        src={carImageSrc} 
                        alt={carBrand} 
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-car.jpg';
                        }}
                      />
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
  searchSection: { backgroundColor: 'white', padding: '15px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' },
  filterGroup: { display: 'flex', flexDirection: 'column' as const, gap: '5px' },
  filterLabel: { fontSize: '12px', fontWeight: 'bold', color: '#475569' },
  filterInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const },
  resetButton: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' as const, display: 'block', margin: '0 auto' },
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
