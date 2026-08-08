'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
  created_at: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    
    const fetchCarDetail = async () => {
      try {
        // طلب تفاصيل السيارة مباشرة من السيرفر الخلفي المحدث
        const res = await fetch(`/api/cars/${params.id}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await res.json();
        if (data.success && data.car) {
          setCar(data.car);
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCarDetail();
  }, [params?.id]);

  // دالة ذكية وفورية لضمان قراءة رابط الصورة كنص نقي متوافق مع قاعدة بيانات Neon الجديدة
  const getCleanImage = (imagesInput: any): string => {
    if (!imagesInput) return '';
    if (Array.isArray(imagesInput) && imagesInput.length > 0) {
      return String(imagesInput[0] || '').trim();
    }
    const cleanStr = String(imagesInput).replace(/[\{\}\"\'\s]/g, '');
    const parts = cleanStr.split(',');
    return parts[0] && parts[0].startsWith('http') ? parts[0] : '';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b' }}>جاري جلب مواصفات السيارة والملفات...</p>
      </div>
    );
  }
  if (!car) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif', direction: 'rtl' }}>
        <h2 style={{ color: '#ef4444' }}>❌ عذراً، الإعلان غير موجود أو تم حذفه!</h2>
        <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>العودة للصفحة الرئيسية ←</Link>
      </div>
    );
  }

  const validImageSrc = getCleanImage(car.images);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={styles.backLink}>← العودة للمعرض</Link>
        <h1 style={styles.headerTitle}>{car.brand} {car.model}</h1>
      </header>

      <div style={styles.contentGrid}>
        {/* صندوق عرض الصورة الرئيسي */}
        <div style={styles.imageCard}>
          {validImageSrc ? (
            <img src={validImageSrc} alt={car.brand} style={styles.mainImage} />
          ) : (
            <div style={styles.noImage}>🚗 لا توجد صورة متوفرة لهذه السيارة</div>
          )}
        </div>

        {/* صندوق تفاصيل ومواصفات السيارة الفنية */}
        <div style={styles.detailsCard}>
          <h2 style={styles.priceTag}>{car.price.toLocaleString()} {car.currency || 'د.أ'}</h2>
          
          <div style={styles.specGrid}>
            <div style={styles.specItem}><span>📅 سنة الصنع:</span> <strong>{car.year || 'غير محدد'}</strong></div>
            <div style={styles.specItem}><span>🛣️ المسافة المقطوعة:</span> <strong>{car.kilometers ? car.kilometers.toLocaleString() + ' كم' : '0 كم'}</strong></div>
            <div style={styles.specItem}><span>🎨 اللون الخارجي:</span> <strong>{car.color || 'غير محدد'}</strong></div>
            <div style={styles.specItem}><span>⏱️ تاريخ النشر:</span> <strong>{new Date(car.created_at).toLocaleDateString('ar-SA')}</strong></div>
          </div>

          <div style={styles.descSection}>
            <h3 style={styles.descTitle}>📝 وصف وتفاصيل الإعلان:</h3>
            <p style={styles.descText}>{car.description || 'لا يوجد وصف إضافي مضاف من المالك.'}</p>
          </div>

          <a href={`https://wa.me{car.description?.match(/\d+/)?.[0] || ''}`} style={styles.contactButton}>💬 تواصل مع المعلن عبر الواتساب</a>
        </div>
      </div>
    </div>
  );
}
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const, padding: '20px' },
  header: { maxWidth: '1200px', margin: '0 auto 20px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e3a8a', padding: '15px 25px', borderRadius: '12px', color: 'white' },
  headerTitle: { fontSize: '18px', margin: 0, fontWeight: 'bold' as const },
  backLink: { color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' as const },
  contentGrid: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  imageCard: { backgroundColor: 'white', borderRadius: '12px', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mainImage: { width: '100%', maxHeight: '400px', objectFit: 'cover' as const, borderRadius: '8px' },
  noImage: { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', backgroundColor: '#f1f5f9', width: '100%', borderRadius: '8px' },
  detailsCard: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' },
  priceTag: { fontSize: '26px', fontWeight: 'bold' as const, color: '#059669', margin: '0 0 20px 0', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' },
  specGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
  specItem: { display: 'flex', flexDirection: 'column' as const, gap: '5px', fontSize: '13px', color: '#64748b', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' },
  descSection: { borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '25px' },
  descTitle: { fontSize: '15px', fontWeight: 'bold' as const, color: '#1e293b', margin: '0 0 10px 0' },
  descText: { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 },
  contactButton: { display: 'block', textAlign: 'center' as const, backgroundColor: '#2563eb', color: 'white', padding: '14px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' as const, fontSize: '14px', transition: 'background 0.2s' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '12px' },
  spinner: { width: '35px', height: '35px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
