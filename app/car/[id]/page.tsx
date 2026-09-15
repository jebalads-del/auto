'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface Car {
  id: string; brand: string; model: string; year?: number; price: number;
  kilometers?: number; color?: string; description?: string; currency?: string;
  status: string; created_at: string; images?: string[]; user_id?: string;
  user_phone?: string;
}
interface User { id: string; name?: string; email?: string; phone?: string; }

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const carId = params.id as string;
        const { data: carData, error: carError } = await supabase.from('cars').select('*').eq('id', carId).single();
        if (carError || !carData) { setError('الإعلان غير موجود'); setLoading(false); return; }
        setCar(carData);
        if (carData.user_id) {
          const { data: userData } = await supabase.from('users').select('id, name, email, phone').eq('id', carData.user_id).single();
          if (userData) setSeller(userData);
        }
      } catch (err) { console.error(err); setError('حدث خطأ في تحميل البيانات'); } finally { setLoading(false); }
    };
    fetchCarDetails();
  }, [params.id]);

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div><p>⏳ جاري تحميل التفاصيل...</p></div>;
  if (error || !car) return <div style={styles.errorContainer}><h2>❌ {error}</h2><Link href="/" style={styles.errorBackLink}>🏠 للرئيسية</Link></div>;

  const sellerName = seller?.name || 'البائع';
  const sellerEmail = seller?.email || '';
  
  const finalPhone = car.user_phone || seller?.phone || '';
  const cleanPhone = finalPhone.replace(/\D/g, '');

  // ✅ تنسيق تاريخ النشر
  const publishDate = car.created_at 
    ? new Date(car.created_at).toLocaleDateString('ar-KW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'غير معروف';

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => router.push('/')} style={styles.backButton}>🔙 الرئيسية</button>
        <h1 style={styles.headerTitle}>تفاصيل المركبة</h1>
        <div style={{ width: '75px' }}></div>
      </header>

      <div style={styles.content}>
        <div style={styles.imageSection}>
          {car.images && car.images.length > 0 ? (
            <div style={styles.imageContainer}>
              <div style={styles.mainImageWrapper}>
                <img src={car.images[currentImageIndex]} alt="car" style={styles.mainImage} />
                {car.images.length > 1 && (
                  <>
                    <button onClick={() => currentImageIndex > 0 && setCurrentImageIndex(currentImageIndex - 1)} style={{ ...styles.navButton, left: '12px' }}>‹</button>
                    <button onClick={() => car.images && currentImageIndex < car.images.length - 1 && setCurrentImageIndex(currentImageIndex + 1)} style={{ ...styles.navButton, right: '12px' }}>›</button>
                  </>
                )}
                <div style={styles.imageCounter}>{currentImageIndex + 1} / {car.images.length}</div>
              </div>
              {car.images.length > 1 && (
                <div style={styles.thumbnailContainer}>
                  {car.images.map((img, idx) => (
                    <img key={idx} src={img} alt="thumb" onClick={() => setCurrentImageIndex(idx)} style={{ ...styles.thumbnail, border: idx === currentImageIndex ? '2px solid #2563eb' : '2px solid transparent', opacity: idx === currentImageIndex ? '1' : '0.6' }} />
                  ))}
                </div>
              )}
            </div>
          ) : <div style={styles.noImage}>🚗 لا توجد صور</div>}
        </div>

        <div style={styles.infoSection}>
          <div style={styles.titlePriceRow}>
            <h2 style={styles.title}>{car.brand} {car.model}</h2>
            <div style={styles.priceTag}>{car.price.toLocaleString()} {car.currency || 'د.ك'}</div>
          </div>
          
          <div style={styles.detailsGrid}>
            {car.year && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📅 سنة الصنع</span>
                <span style={styles.detailValue}>{car.year}</span>
              </div>
            )}
            {car.kilometers && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📊 عداد الممشى</span>
                <span style={styles.detailValue}>{car.kilometers.toLocaleString()} كم</span>
              </div>
            )}
            {car.color && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🎨 لون المركبة</span>
                <span style={styles.detailValue}>{car.color}</span>
              </div>
            )}
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📌 حالة الإعلان</span>
              <span style={{ ...styles.detailValue, color: car.status === 'approved' ? '#16a34a' : '#ef4444' }}>
                {car.status === 'approved' ? '✅ متاح' : '💰 تم البيع'}
              </span>
            </div>
            
            {/* ✅ تاريخ نشر الإعلان - جديد */}
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>🕒 تاريخ النشر</span>
              <span style={styles.detailValue}>{publishDate}</span>
            </div>
          </div>

          {car.description && (
            <div style={styles.cardSection}>
              <h3 style={styles.sectionTitle}>📝 التفاصيل</h3>
              <p style={styles.descriptionText}>{car.description}</p>
            </div>
          )}
          
          <div style={styles.cardSection}>
            <h3 style={styles.sectionTitle}>👤 المعلن</h3>
            <div style={styles.sellerInfo}>
              <span style={styles.sellerName}>{sellerName}</span>
              {sellerEmail && <span style={styles.sellerEmail}>📧 {sellerEmail}</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.stickyStickyContact}>
        <div style={styles.contactButtonsContainer}>
          {cleanPhone && (
            <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.contactBtn, backgroundColor: '#22c55e' }}>💬 واتساب</a>
          )}
          {sellerEmail && (
            <a href={`mailto:${sellerEmail}`} style={{ ...styles.contactBtn, backgroundColor: '#ef4444' }}>📧 إيميل</a>
          )}
          {cleanPhone && (
            <a href={`tel:${cleanPhone}`} style={{ ...styles.contactBtn, backgroundColor: '#3b82f6' }}>📞 اتصال</a>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { direction: 'rtl' as const, backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '90px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', position: 'sticky' as const, top: 0, zIndex: 100 },
  backButton: { backgroundColor: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#334155', cursor: 'pointer' },
  headerTitle: { fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 },
  content: { padding: '14px', maxWidth: '600px', margin: '0 auto' },
  imageSection: { marginBottom: '16px' },
  imageContainer: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '8px', border: '1px solid #e2e8f0' },
  mainImageWrapper: { position: 'relative' as const, width: '100%', height: '240px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' },
  mainImage: { width: '100%', height: '100%', objectFit: 'cover' as const },
  navButton: { position: 'absolute' as const, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.85)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imageCounter: { position: 'absolute' as const, bottom: '12px', left: '12px', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' },
  thumbnailContainer: { display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto' as const },
  thumbnail: { width: '60px', height: '45px', objectFit: 'cover' as const, borderRadius: '6px', cursor: 'pointer', flexShrink: 0 },
  noImage: { width: '100%', height: '200px', backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' },
  infoSection: { display: 'flex', flexDirection: 'column' as const, gap: '14px' },
  titlePriceRow: { backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 },
  priceTag: { fontSize: '20px', fontWeight: '900', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '6px 14px', borderRadius: '10px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#ffffff', padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0' },
  detailItem: { backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '10px', display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  detailLabel: { fontSize: '11px', color: '#64748b', fontWeight: '600' },
  detailValue: { fontSize: '14px', color: '#1e293b', fontWeight: '700' },
  cardSection: { backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#475569', marginTop: 0, marginBottom: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '6px' },
  descriptionText: { fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' as const },
  sellerInfo: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  sellerName: { fontSize: '15px', fontWeight: '700', color: '#1e293b' },
  sellerEmail: { fontSize: '13px', color: '#64748b' },
  stickyStickyContact: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: '12px 16px', borderTop: '1px solid #e2e8f0', zIndex: 999 },
  contactButtonsContainer: { display: 'flex', gap: '10px', maxWidth: '600px', margin: '0 auto' },
  contactBtn: { flex: 1, color: '#ffffff', textDecoration: 'none', textAlign: 'center' as const, padding: '12px 0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  spinner: { width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTop: '3px solid #2563eb', borderRadius: '50%' },
  errorContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' },
  errorBackLink: { textDecoration: 'none', backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px' }
};
