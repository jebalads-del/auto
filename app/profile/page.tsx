'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  subscription: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCars, setUserCars] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchUserCars();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`/api/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCars = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`/api/user/${userId}/cars`);
      const data = await response.json();
      if (data.success) {
        setUserCars(data.cars);
      }
    } catch (error) {
      console.error('خطأ في جلب إعلانات المستخدم:', error);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* الهيدر */}
      <div style={styles.header}>
        <h1 style={styles.title}>👤 حسابي</h1>
        <Link href="/" style={styles.backLink}>← العودة للرئيسية</Link>
      </div>

      {/* بطاقة المعلومات الشخصية */}
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div style={styles.userInfo}>
          <h2 style={styles.userName}>{user?.name || 'مستخدم'}</h2>
          <p style={styles.userEmail}>{user?.email}</p>
          <div style={styles.badge}>
            <span style={{
              ...styles.roleBadge,
              backgroundColor: user?.role === 'admin' ? '#fef3c7' : '#dbeafe',
              color: user?.role === 'admin' ? '#92400e' : '#1e40af',
            }}>
              {user?.role === 'admin' ? '🛡️ مدير' : '👤 مستخدم عادي'}
            </span>
            <span style={{
              ...styles.roleBadge,
              backgroundColor: user?.status === 'active' ? '#d1fae5' : '#fee2e2',
              color: user?.status === 'active' ? '#065f46' : '#991b1b',
            }}>
              {user?.status === 'active' ? '✅ مفعّل' : '⏳ غير مفعّل'}
            </span>
          </div>
        </div>
      </div>

      {/* نوع الاشتراك */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📦 نوع الاشتراك</h3>
        <div style={styles.subscriptionCard}>
          <div style={styles.subscriptionBadge}>
            {user?.role === 'admin' ? '👑 اشتراك إداري' : '📋 اشتراك مجاني'}
          </div>
          <p style={styles.subscriptionDate}>
            تاريخ التسجيل: {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : 'غير معروف'}
          </p>
        </div>
      </div>

      {/* إعلانات المستخدم */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🚗 إعلاناتي</h3>
        {userCars.length === 0 ? (
          <div style={styles.emptyState}>
            <p>📭 لا توجد إعلانات حالياً</p>
            <Link href="/dashboard/cars/new" style={styles.addBtn}>
              ➕ نشر إعلان جديد
            </Link>
          </div>
        ) : (
          <div style={styles.carsGrid}>
            {userCars.map((car: any) => (
              <div key={car.id} style={styles.carCard}>
                <div style={styles.carImage}>
                  {car.images?.length > 0 ? (
                    <img src={car.images[0]} alt={car.model} style={styles.carImg} />
                  ) : (
                    <div style={styles.noImage}>🚗</div>
                  )}
                </div>
                <div style={styles.carInfo}>
                  <h4>{car.brand} {car.model}</h4>
                  <p>💰 ${car.price.toLocaleString()}</p>
                  <span style={{
                    ...styles.carStatus,
                    backgroundColor: car.status === 'approved' ? '#d1fae5' : 
                                   car.status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: car.status === 'approved' ? '#065f46' : 
                           car.status === 'pending' ? '#92400e' : '#991b1b',
                  }}>
                    {car.status === 'approved' ? '✅ مقبول' : 
                     car.status === 'pending' ? '⏳ قيد المراجعة' : '❌ مرفوض'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    direction: 'rtl' as const,
    padding: '20px',
    fontFamily: 'sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap' as const,
  },
  title: {
    fontSize: '28px',
    color: '#1e293b',
    margin: 0,
  },
  backLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '8px 16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '25px',
    flexWrap: 'wrap' as const,
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '22px',
    margin: 0,
    color: '#1e293b',
  },
  userEmail: {
    color: '#64748b',
    margin: '5px 0 10px',
  },
  badge: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#1e293b',
    marginBottom: '15px',
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textAlign: 'center' as const,
  },
  subscriptionBadge: {
    display: 'inline-block',
    padding: '8px 24px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  subscriptionDate: {
    color: '#64748b',
    marginTop: '10px',
  },
  carsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px',
  },
  carCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s',
  },
  carImage: {
    height: '150px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  noImage: {
    fontSize: '48px',
    color: '#94a3b8',
  },
  carInfo: {
    padding: '15px',
  },
  carStatus: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginTop: '5px',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center' as const,
    color: '#64748b',
  },
  addBtn: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
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
};
