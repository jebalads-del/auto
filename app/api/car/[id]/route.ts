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
  created_at: string;
}

export default function CarDetailsPage() {
  const params = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <Link href="/" style={styles.backLink}>← العودة للرئيسية</Link>

      <div style={styles.gallery}>
        {car.images && car.images.length > 0 ? (
          <div style={styles.imageGrid}>
            {car.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${car.brand} ${car.model}`}
                style={styles.mainImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
          </div>
        ) : (
          <div style={styles.noImage}>🚗 لا توجد صور</div>
        )}
      </div>

      <div style={styles.infoCard}>
        <h1 style={styles.title}>{car.brand} {car.model}</h1>
        <div style={styles.priceTag}>💰 ${car.price.toLocaleString()}</div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>📅 السنة</span>
            <span style={styles.detailValue}>{car.year}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>📏 الممشى</span>
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
        </div>

        {car.description && (
          <div style={styles.descriptionSection}>
            <h3 style={styles.sectionTitle}>📝 الوصف</h3>
            <p style={styles.description}>{car.description}</p>
          </div>
        )}

        <div style={styles.contactSection}>
          <h3 style={styles.sectionTitle}>📞 التواصل مع البائع</h3>
          <div style={styles.contactButtons}>
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
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    direction: 'rtl' as const,
    padding: '20px',
    fontFamily: 'sans-serif',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  gallery: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '5px',
    padding: '5px',
  },
  mainImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover' as const,
    borderRadius: '8px',
  },
  noImage: {
    padding: '60px',
    textAlign: 'center' as const,
    fontSize: '48px',
    color: '#94a3b8',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '28px',
    margin: '0 0 10px 0',
    color: '#1e293b',
  },
  priceTag: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: '20px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  detailItem: {
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '8px',
  },
  detailLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  descriptionSection: {
    marginTop: '20px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    color: '#1e293b',
    marginBottom: '10px',
  },
  description: {
    color: '#475569',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap' as const,
  },
  contactSection: {
    marginTop: '20px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
  },
  contactButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  contactBtn: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
  copyBtn: {
    padding: '10px 20px',
    backgroundColor: '#475569',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
  },
  spinner: {
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#991b1b',
    textAlign: 'center' as const,
  },
};
