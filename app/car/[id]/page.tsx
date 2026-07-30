'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  user_name: string;
  user_email: string;
  user_phone: string;
  created_at: string;
  currency: string;
  status: string; // ✅ أضفنا هذا الحقل
}

export default function CarDetailsPage() {
  const params = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (!params.id) return;
      
      try {
        const response = await fetch(`/api/car/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setCar(data.car);
        } else {
          setError(data.message || 'الإعلان غير موجود');
        }
      } catch {
        setError('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [params.id]);

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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div style={styles.errorContainer}>
        <h2>⚠️ {error || 'الإعلان غير موجود'}</h2>
        <Link href="/" style={styles.backLink}>← العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>🚗 سيارتي</h1>
          <div style={styles.headerLinks}>
            <Link href="/" style={styles.headerLink}>الرئيسية</Link>
            <Link href="/login" style={styles.headerLink}>دخول</Link>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <Link href="/" style={styles.backLink}>← العودة للرئيسية</Link>

        {/* ✅ شارة "مباعة" عريضة تظهر أعلى الصور بشكل بارز */}
        {car.status === 'sold' && (
          <div style={{
            backgroundColor: '#ef4444',
            color: 'white',
            textAlign: 'center',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '18px',
            marginBottom: '15px',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
          }}>
            🔒 تم بيع هذه السيارة رسميًا
          </div>
        )}

        <div style={styles.gallery}>
          {car.images && car.images.length > 0 ? (
            <div style={styles.imageGrid}>
              {car.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${car.brand} ${car.model}`}
                  style={styles.mainImage}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          ) : (
            <div style={styles.noImage}>🚗 لا توجد صور</div>
          )}
        </div>

        {selectedImage && (
          <div style={styles.lightbox} onClick={() => setSelectedImage(null)}>
            <span style={styles.closeBtn}>&times;</span>
            <img src={selectedImage} alt="صورة مكبرة" style={styles.lightboxImage} />
          </div>
        )}

        <div style={styles.infoCard}>
          <h1 style={styles.title}>{car.brand} {car.model}</h1>
          <div style={styles.priceTag}>
            💰 {getCurrencySymbol(car.currency)} {car.price.toLocaleString()}
          </div>

          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📅 السنة</span>
              <span style={styles.detailValue}>{car.year}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📏 الكيلومترات</span>
              <span style={styles.detailValue}>{car.kilometers?.toLocaleString() || 0} كم</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>🎨 اللون</span>
              <span style={styles.detailValue}>{car.color || 'غير محدد'}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📅 النشر</span>
              <span style={styles.detailValue}>
                {new Date(car.created_at).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>👤 الناشر</span>
              <span style={styles.detailValue}>{car.user_name || 'مستخدم'}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>📧 البريد</span>
              <span style={styles.detailValue}>{car.user_email || 'غير متوفر'}</span>
            </div>
            {car.user_phone && (
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📱 الهاتف</span>
                <span style={styles.detailValue}>{car.user_phone}</span>
              </div>
            )}
          </div>

          {car.description && (
            <div style={styles.descriptionSection}>
              <h3 style={styles.sectionTitle}>📝 الوصف</h3>
              <p style={styles.description}>{car.description}</p>
            </div>
          )}

          {/* إلغاء تفعيل أزرار التواصل إذا كانت السيارة مباعة */}
          <div style={styles.contactSection}>
            <h3 style={styles.sectionTitle}>📞 التواصل مع البائع</h3>
            {car.status === 'sold' ? (
              <p style={{ color: '#ef4444', fontWeight: 'bold' }}>🚫 لا يمكن التواصل مع البائع لأن السيارة تم بيعها.</p>
            ) : (
              <div style={styles.contactButtons}>
                {car.user_phone && (
                  <a
                    href={`https://wa.me/${car.user_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.whatsappBtn}
                  >
                    💬 واتساب
                  </a>
                )}
                <a href={`mailto:${car.user_email}`} style={styles.contactBtn}>
                  📧 مراسلة البائع
                </a>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(car.user_email || '');
                    alert('✅ تم نسخ البريد الإلكتروني');
                  }}
                  style={styles.copyBtn}
                >
                  📋 نسخ البريد
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  header: { backgroundColor: '#1e293b', padding: '12px 20px', color: 'white' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '10px' },
  headerTitle: { color: '#38bdf8', margin: 0, fontSize: '18px' },
  headerLinks: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' as const },
  headerLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '20px' },
  backLink: { display: 'inline-block', marginBottom: '20px', color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' },
  gallery: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '5px', padding: '5px' },
  mainImage: { width: '100%', height: '300px', objectFit: 'cover' as const, borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' },
  noImage: { padding: '60px', textAlign: 'center' as const, fontSize: '48px', color: '#94a3b8' },
  infoCard: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  title: { fontSize: '24px', marginBottom: '10px', color: '#1e293b' },
  priceTag: { fontSize: '20px', color: '#10b981', fontWeight: 'bold', marginBottom: '20px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' },
  detailItem: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  detailLabel: { fontSize: '12px', color: '#64748b' },
  detailValue: { fontSize: '14px', fontWeight: 'bold', color: '#334155' },
  descriptionSection: { borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '25px' },
  sectionTitle: { fontSize: '16px', color: '#1e293b', marginBottom: '10px' },
  description: { fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-line' as const },
  contactSection: { borderTop: '1px solid #e2e8f0', paddingTop: '20px' },
  contactButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap' as const },
  whatsappBtn: { backgroundColor: '#25d366', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' },
  contactBtn: { backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' },
  copyBtn: { backgroundColor: '#64748b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '10px' },
  spinner: { width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorContainer: { textAlign: 'center' as const, padding: '40px' },
  lightbox: { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  lightboxImage: { maxWidth: '90%', maxHeight: '90%', borderRadius: '8px' },
  closeBtn: { position: 'absolute' as const, top: '20px', right: '30px', color: 'white', fontSize: '40px', fontWeight: 'bold', cursor: 'pointer' }
};
