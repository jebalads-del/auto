'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

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

interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const carId = params.id as string;
        
        const { data: carData, error: carError } = await supabase
          .from('cars')
          .select('*')
          .eq('id', carId)
          .single();

        if (carError || !carData) {
          setError('الإعلان غير موجود');
          setLoading(false);
          return;
        }

        setCar(carData);

        if (carData.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, name, email, phone')
            .eq('id', carData.user_id)
            .single();

          if (!userError && userData) {
            setSeller(userData);
          }
        }

      } catch (err) {
        console.error('❌ خطأ:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [params.id, supabase]);

  const nextImage = () => {
    if (car?.images && currentImageIndex < car.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>⏳ جاري تحميل التفاصيل...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div style={styles.errorContainer}>
        <h2>❌ {error || 'الإعلان غير موجود'}</h2>
        <Link href="/" style={styles.backLink}>← العودة للرئيسية</Link>
      </div>
    );
  }

  const sellerName = seller?.name || 'البائع';
  const sellerPhone = seller?.phone || '';
  const sellerEmail = seller?.email || '';

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link href="/" style={styles.backLink}>← العودة للرئيسية</Link>
          <h1 style={styles.headerTitle}>🚗 تفاصيل الإعلان</h1>
        </div>
      </header>

      <div style={styles.content}>
        {/* الصور في الأعلى */}
        <div style={styles.imageSection}>
          {car.images && car.images.length > 0 ? (
            <div style={styles.imageContainer}>
              <div style={styles.mainImageWrapper}>
                <img 
                  src={car.images[currentImageIndex]} 
                  alt={`${car.brand} ${car.model}`}
                  style={styles.mainImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {car.images.length > 1 && (
                  <>
                    <button onClick={prevImage} style={{ ...styles.navButton, left: '10px' }} disabled={currentImageIndex === 0}>
                      ‹
                    </button>
                    <button onClick={nextImage} style={{ ...styles.navButton, right: '10px' }} disabled={currentImageIndex === car.images.length - 1}>
                      ›
                    </button>
                  </>
                )}
              </div>
              {car.images.length > 1 && (
                <div style={styles.thumbnailContainer}>
                  {car.images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img}
                      alt={`صورة ${idx + 1}`}
                      style={{
                        ...styles.thumbnail,
                        border: idx === currentImageIndex ? '3px solid #2563eb' : '2px solid transparent'
                      }}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
              <div style={styles.imageCounter}>
                {currentImageIndex + 1} / {car.images.length}
              </div>
            </div>
          ) : (
            <div style={styles.noImage}>
              🚗 لا توجد صور
            </div>
          )}
        </div>

        {/* المعلومات تحت الصورة */}
        <div style={styles.infoSection}>
          <h2 style={styles.title}>{car.brand} {car.model}</h2>
          
          <div style={styles.price}>
            {car.price.toLocaleString()} {car.currency === 'SAR' ? 'ر.س' : 'د.ك'}
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
                <span style={styles.detailLabel}>📊 المشي</span>
                <span style={styles.detailValue}>{car.kilometers.toLocaleString()} كم</span>
              </div>
            )}
            {car.color && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🎨 اللون</span>
                <span style={styles.detailValue}>{car.color}</span>
              </div>
            )}
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📅 تاريخ النشر</span>
              <span style={styles.detailValue}>
                {new Date(car.created_at).toLocaleDateString('ar-KW')}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📌 الحالة</span>
              <span style={{
                ...styles.detailValue,
                color: car.status === 'approved' ? '#16a34a' : '#f59e0b',
                fontWeight: 'bold'
              }}>
                {car.status === 'approved' ? '✅ متاح' : car.status === 'sold' ? '💰 مباع' : '⏳ قيد المراجعة'}
              </span>
            </div>
          </div>

          {car.description && (
            <div style={styles.description}>
              <h3 style={styles.sectionTitle}>📝 تفاصيل الإعلان</h3>
              <p style={styles.descriptionText}>{car.description}</p>
            </div>
          )}

          {/* معلومات البائع */}
          <div style={styles.sellerSection}>
            <h3 style={styles.sectionTitle}>👤 معلومات البائع</h3>
            <div style={styles.sellerInfo}>
              <span style={styles.sellerName}>{sellerName}</span>
              {sellerEmail && <span style={styles.sellerEmail}>📧 {sellerEmail}</span>}
              {sellerPhone && <span style={styles.sellerPhone}>📞 {sellerPhone}</span>}
            </div>
          </div>

          {/* أزرار التواصل */}
          <div style={styles.contactSection}>
            <h3 style={styles.sectionTitle}>📞 وسائل التواصل مع البائع</h3>
            
            <div style={styles.contactButtons}>
              {sellerPhone ? (
                <a 
                  href={`https://wa.me/${sellerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.whatsappButton}
                >
                  <span style={{ fontSize: '20px' }}>💬</span>
                  واتساب
                </a>
              ) : (
                <div style={styles.disabledButton}>
                  <span style={{ fontSize: '20px' }}>💬</span>
                  رقم غير متوفر
                </div>
              )}
              
              {sellerEmail ? (
                <a 
                  href={`mailto:${sellerEmail}?subject=استفسار عن إعلان ${car.brand} ${car.model}`}
                  style={styles.emailButton}
                >
                  <span style={{ fontSize: '20px' }}>📧</span>
                  إيميل
                </a>
              ) : (
                <div style={styles.disabledButton}>
                  <span style={{ fontSize: '20px' }}>📧</span>
                  إيميل غير متوفر
                </div>
              )}
              
              {sellerPhone ? (
                <a 
                  href={`tel:${sellerPhone.replace(/[^0-9]/g, '')}`}
                  style={styles.callButton}
                >
                  <span style={{ fontSize: '20px' }}>📞</span>
                  اتصال
                </a>
              ) : (
                <div style={styles.disabledButton}>
                  <span style={{ fontSize: '20px' }}>📞</span>
                  رقم غير متوفر
                </div>
              )}
            </div>
            
            {!sellerPhone && (
              <p style={styles.noteText}>
                💡 رقم الهاتف غير متوفر حالياً. يمكنك التواصل عن طريق الإيميل.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  header: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '15px 20px', position: 'sticky' as const, top: 0, zIndex: 10 },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' },
  headerTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  backLink: { fontSize: '14px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' },
  content: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '20px', 
    display: 'flex', 
    flexDirection: 'column' as const, 
    gap: '25px' 
  },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorContainer: { textAlign: 'center' as const, padding: '40px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '12px', margin: '40px' },
  imageSection: { 
    width: '100%' 
  },
  imageContainer: { position: 'relative' as const },
  mainImageWrapper: { position: 'relative' as const, backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' },
  mainImage: { width: '100%', height: '400px', objectFit: 'cover' as const },
  navButton: { position: 'absolute' as const, top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  thumbnailContainer: { display: 'flex', gap: '10px', marginTop: '10px', overflowX: 'auto' as const, paddingBottom: '5px' },
  thumbnail: { width: '80px', height: '80px', objectFit: 'cover' as const, borderRadius: '8px', cursor: 'pointer', flexShrink: 0 },
  imageCounter: { position: 'absolute' as const, bottom: '15px', right: '15px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' },
  noImage: { width: '100%', height: '400px', backgroundColor: '#e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#94a3b8' },
  infoSection: { 
    width: '100%', 
    display: 'flex', 
    flexDirection: 'column' as const, 
    gap: '20px' 
  },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  price: { fontSize: '32px', fontWeight: '800', color: '#16a34a' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  detailItem: { backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  detailLabel: { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' },
  detailValue: { fontSize: '16px', fontWeight: '500', color: '#1e293b' },
  description: { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' },
  descriptionText: { fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 },
  sellerSection: { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  sellerInfo: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  sellerName: { fontSize: '16px', fontWeight: '600', color: '#1e293b' },
  sellerEmail: { fontSize: '14px', color: '#64748b' },
  sellerPhone: { fontSize: '14px', color: '#64748b' },
  contactSection: { 
    backgroundColor: '#f8fafc', 
    padding: '20px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0',
    marginTop: '10px'
  },
  contactButtons: { 
    display: 'flex', 
    gap: '12px', 
    flexWrap: 'wrap' as const,
    marginTop: '10px'
  },
  whatsappButton: { 
    flex: 1, 
    minWidth: '120px',
    padding: '14px 20px', 
    backgroundColor: '#25D366', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    textAlign: 'center' as const, 
    textDecoration: 'none', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px'
  },
  emailButton: { 
    flex: 1, 
    minWidth: '120px',
    padding: '14px 20px', 
    backgroundColor: '#EA4335', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    textAlign: 'center' as const, 
    textDecoration: 'none', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px'
  },
  callButton: { 
    flex: 1, 
    minWidth: '120px',
    padding: '14px 20px', 
    backgroundColor: '#2563eb', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    textAlign: 'center' as const, 
    textDecoration: 'none', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px'
  },
  disabledButton: { 
    flex: 1, 
    minWidth: '120px',
    padding: '14px 20px', 
    backgroundColor: '#e2e8f0', 
    color: '#94a3b8', 
    borderRadius: '10px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    textAlign: 'center' as const, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px',
    opacity: 0.7
  },
  noteText: { 
    fontSize: '13px', 
    color: '#64748b', 
    marginTop: '10px',
    textAlign: 'center' as const,
    fontStyle: 'italic'
  }
};
