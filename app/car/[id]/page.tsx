'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Car {
  id?: number;
  ID?: number;
  brand?: string;
  BRAND?: string;
  model?: string;
  MODEL?: string;
  year?: number;
  YEAR?: number;
  price?: number;
  PRICE?: number;
  kilometers?: number;
  KILOMETERS?: number;
  color?: string;
  COLOR?: string;
  description?: string;
  DESCRIPTION?: string;
  images?: any; 
  IMAGES?: any;
  status?: string;
  STATUS?: string;
  currency?: string;
  CURRENCY?: string;
}

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        const res = await fetch(`/api/cars/${params.id}`);
        const data = await res.json();
        // دعم لنسق رد السيرفر الفردي أو داخل كائن car
        if (data && data.success) {
          setCar(data.car || data.data || data);
        } else if (data && data.id || data && data.ID) {
          setCar(data);
        }
      } catch (error) {
        console.error("Failed to fetch car detail:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchCarDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b', marginTop: '15px' }}>جاري تحميل تفاصيل السيارة...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ textAlign: 'center', color: '#ef4444' }}>عذراً، الإعلان غير موجود أو تم حذفه ❌</p>
          <Link href="/" style={styles.backLink}>← العودة لمعرض السيارات</Link>
        </div>
      </div>
    );
  }

  // استخراج المتغيرات بأمان كامل بحروف كبيرة وصغيرة
  const carBrand = car.brand || car.BRAND || '';
  const carModel = car.model || car.MODEL || '';
  const carPrice = car.price || car.PRICE || 0;
  const carYear = car.year || car.YEAR || '';
  const carColor = car.color || car.COLOR || '';
  const carKms = car.kilometers || car.KILOMETERS || 0;
  const carDesc = car.description || car.DESCRIPTION || '';
  const carStatus = car.status || car.STATUS || '';
  const carCurrency = car.currency || car.CURRENCY || 'د.ك';
  const carImagesRaw = car.images || car.IMAGES;

  // استخراج وتفكيك مصفوفة الصور بالكامل لصفحة التفاصيل المعمقة
  let allImages: string[] = [];
  if (carImagesRaw) {
    if (Array.isArray(carImagesRaw)) {
      allImages = carImagesRaw.map((img: any) => typeof img === 'string' ? img.trim() : '').filter(Boolean);
    } else if (typeof carImagesRaw === 'string') {
      const cleanedStr = carImagesRaw.trim();
      if (cleanedStr.includes(',')) {
        allImages = cleanedStr.split(',').map(img => img.trim()).filter(Boolean);
      } else if (cleanedStr) {
        allImages = [cleanedStr];
      }
    }
  }
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Link href="/" style={styles.backLink}>← العودة لمعرض السيارات</Link>
        <h2 style={styles.title}>{carBrand} {carModel}</h2>
        
        {/* صالة عرض الصور الداخلية */}
        <div style={styles.galleryContainer}>
          {allImages.length > 0 ? (
            <div style={styles.imagesGrid}>
              {allImages.map((src, idx) => (
                <img 
                  key={idx} 
                  src={src} 
                  alt={`${carBrand} - ${idx + 1}`} 
                  style={styles.detailImage} 
                />
              ))}
            </div>
          ) : (
            <div style={styles.noImage}>🚗 لا توجد صور متوفرة لهذه السيارة</div>
          )}
        </div>

        {/* قائمة البيانات التفصيلية المطابقة لشاشتك */}
        <div style={styles.detailsList}>
          <div style={styles.detailItem}><span style={styles.detailLabel}>السعر:</span> <span style={styles.detailValue}>{carPrice.toLocaleString()} {carCurrency}</span></div>
          <div style={styles.detailItem}><span style={styles.detailLabel}>السنة:</span> <span style={styles.detailValue}>{carYear}</span></div>
          <div style={styles.detailItem}><span style={styles.detailLabel}>اللون:</span> <span style={styles.detailValue}>{carColor}</span></div>
          <div style={styles.detailItem}><span style={styles.detailLabel}>المسافة:</span> <span style={styles.detailValue}>{carKms.toLocaleString()} كم</span></div>
          <div style={styles.detailItem}><span style={styles.detailLabel}>الوصف:</span> <span style={styles.detailValue}>{carDesc}</span></div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>الحالة:</span> 
            <span style={styles.detailValue}>
              {carStatus === 'approved' || carStatus === 'approved' ? '✅ موافق عليه' : carStatus === 'sold' ? '🚗 تم البيع' : '⏳ قيد المراجعة'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px 15px', fontFamily: 'sans-serif', direction: 'rtl' as const },
  card: { maxWidth: '700px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  backLink: { display: 'inline-block', color: '#2563eb', textDecoration: 'none', fontSize: '13px', marginBottom: '15px', fontWeight: 'bold' },
  title: { fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', marginTop: 0 },
  galleryContainer: { marginBottom: '25px', width: '100%' },
  imagesGrid: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
  detailImage: { width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' as const, borderRadius: '12px', border: '1px solid #e2e8f0' },
  noImage: { width: '100%', height: '200px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', fontSize: '14px' },
  detailsList: { display: 'flex', flexDirection: 'column' as const, gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' },
  detailItem: { display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f8fafc', fontSize: '14px' },
  detailLabel: { fontWeight: 'bold', color: '#64748b' },
  detailValue: { color: '#1e293b', fontWeight: '5px' as any },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%' }
};
