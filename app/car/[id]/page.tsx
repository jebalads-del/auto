'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Car {
  id: number; brand: string; model: string; year: number; price: number;
  kilometers: number; color: string; description: string; images: string; status: string; currency: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchCarDetail = async () => {
      try {
        const res = await fetch(`/api/cars?id=${id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.car) {
            const currentCar = Array.isArray(data.car) ? data.car[0] : data.car;
            if (currentCar) {
              setCar(currentCar);
              if (currentCar.images) {
                let parsedUrls: string[] = [];
                try {
                  // محاولة قراءة الصور إذا كانت مصفوفة JSON مشفرة (للإعلانات الجديدة)
                  const cleanImages = currentCar.images.trim();
                  if (cleanImages.startsWith('[') && cleanImages.endsWith(']')) {
                    parsedUrls = JSON.parse(cleanImages);
                  } else {
                    // الطريقة الاحتياطية القديمة المفصولة بفاصلة
                    parsedUrls = cleanImages.split(',').map((img: string) => img.trim()).filter(Boolean);
                  }
                } catch (e) {
                  // حماية في حال حدوث خطأ أثناء فك التشفير
                  parsedUrls = currentCar.images.split(',').map((img: string) => img.trim()).filter(Boolean);
                }
                
                setImagesList(parsedUrls);
                if (parsedUrls.length > 0) {
                  setActiveImage(parsedUrls[0]);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetail();
  }, [id]);

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;
  if (!car) return <div style={styles.loadingContainer}><p>⚠️ عذراً، لم يتم العثور على السيارة المطلوبة</p></div>;
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>🚗 تفاصيل السيارة المعروضة</h1>
          <Link href="/" style={styles.headerLink}>← العودة لمعرض السيارات</Link>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.imageCard}>
          {activeImage ? (
            <img src={activeImage} alt={car.brand} style={styles.mainImage} onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }} />
          ) : (
            <div style={styles.noImagePlaceholder}>🚗 لا توجد صورة متوفرة</div>
          )}

          {imagesList.length > 1 && (
            <div style={styles.thumbnailContainer}>
              {imagesList.map((img, idx) => (
                <img key={idx} src={img} alt="thumbnail" onClick={() => setActiveImage(img)} style={{
                  ...styles.thumbnail,
                  border: activeImage === img ? '2px solid #2563eb' : '1px solid #cbd5e1'
                }} />
              ))}
            </div>
          )}
        </div>

        <div style={styles.detailsCard}>
          <h2 style={styles.carMainTitle}>{car.brand} {car.model}</h2>
          <div style={styles.priceTag}>{car.price?.toLocaleString()} {car.currency === 'SAR' ? 'ريال سعودي' : 'دينار كويتي'}</div>

          <div style={styles.specsGrid}>
            <div style={styles.specItem}><span style={styles.specLabel}>📅 سنة الصنع:</span><span style={styles.specValue}>{car.year}</span></div>
            <div style={styles.specItem}><span style={styles.specLabel}>🎨 اللون الخارجي:</span><span style={styles.specValue}>{car.color || 'غير محدد'}</span></div>
            <div style={styles.specItem}><span style={styles.specLabel}>📟 المسافة المقطوعة:</span><span style={styles.specValue}>{car.kilometers?.toLocaleString()} كم</span></div>
            <div style={styles.specItem}><span style={styles.specLabel}>🛡️ حالة الإعلان:</span><span style={styles.statusBadge}>🟢 موافق عليه ونشط</span></div>
          </div>

          <hr style={{ border: 0, height: '1px', backgroundColor: '#e2e8f0', margin: '20px 0' }} />

          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>📝 وصف ومواصفات السيارة:</h3>
          <p style={styles.descriptionText}>{car.description || 'لا يوجد وصف إضافي مكتوب لهذه السيارة.'}</p>
        </div>
      </div>
    </div>
  );
}
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  header: { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#ffffff', padding: '15px 20px' },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto' },
  headerTitle: { fontSize: '16px', fontWeight: 'bold', margin: 0 },
  headerLink: { fontSize: '13px', color: '#bfdbfe', textDecoration: 'none', fontWeight: '600' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '20px 12px' },
  imageCard: { backgroundColor: '#ffffff', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', textAlign: 'center' as const },
  mainImage: { width: '100%', maxHeight: '380px', objectFit: 'cover' as const, borderRadius: '12px' },
  noImagePlaceholder: { height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', backgroundColor: '#f1f5f9', borderRadius: '12px' },
  thumbnailContainer: { display: 'flex', gap: '8px', overflowX: 'auto' as const, marginTop: '12px', paddingBottom: '5px', justifyContent: 'center' },
  thumbnail: { width: '60px', height: '45px', objectFit: 'cover' as const, borderRadius: '6px', cursor: 'pointer' },
  detailsCard: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' },
  carMainTitle: { fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 10px 0' },
  priceTag: { fontSize: '24px', fontWeight: '800', color: '#10b981', marginBottom: '20px' },
  specsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' },
  specItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  specLabel: { fontSize: '13px', color: '#64748b', fontWeight: '600' },
  specValue: { fontSize: '14px', color: '#1e293b', fontWeight: '700' },
  statusBadge: { fontSize: '12px', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' },
  descriptionText: { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' as const },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '35px', height: '35px', border: '3px solid #e2e8f0', borderTop: '3px solid #1e3a8a', borderRadius: '50%' }
};
