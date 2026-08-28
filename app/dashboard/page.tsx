'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    pending: 0,
    approved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'user';
    const name = localStorage.getItem('userName') || 'المدير';
    setUserRole(role);
    setUserName(name);

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/cars');
        const data = await res.json();
        if (data.success) {
          const cars = data.cars || [];
          const pending = cars.filter((c: any) => c.status === 'pending');
          const approved = cars.filter((c: any) => c.status === 'approved');
          setStats({
            users: 0,
            cars: cars.length,
            pending: pending.length,
            approved: approved.length
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.success) {
          setStats(prev => ({ ...prev, users: data.users?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/');
    });
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.headerTitle}>🚗 لوحة تحكم الإدارة المطورة</h1>
            <p style={styles.headerSubtitle}>مرحباً بك، {userName} 👋</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 تسجيل خروج
          </button>
        </div>
      </header>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>👥</span>
          <div>
            <h3 style={styles.statNumber}>{stats.users}</h3>
            <p style={styles.statLabel}>إجمالي المستخدمين</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>🚗</span>
          <div>
            <h3 style={styles.statNumber}>{stats.cars}</h3>
            <p style={styles.statLabel}>إجمالي السيارات</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>⏳</span>
          <div>
            <h3 style={styles.statNumber}>{stats.pending}</h3>
            <p style={styles.statLabel}>قيد الانتظار</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>✅</span>
          <div>
            <h3 style={styles.statNumber}>{stats.approved}</h3>
            <p style={styles.statLabel}>مقبولة</p>
          </div>
        </div>
      </div>

      <div style={styles.actionsGrid}>
        <Link href="/dashboard/cars" style={styles.actionCard}>
          <span style={styles.actionIcon}>🚗</span>
          <div>
            <h3 style={styles.actionTitle}>إدارة الإعلانات</h3>
            <p style={styles.actionDesc}>عرض، موافقة، حذف الإعلانات</p>
          </div>
        </Link>

        <Link href="/dashboard/users" style={styles.actionCard}>
          <span style={styles.actionIcon}>👥</span>
          <div>
            <h3 style={styles.actionTitle}>إدارة المستخدمين</h3>
            <p style={styles.actionDesc}>تفعيل، تعطيل، حذف المستخدمين</p>
          </div>
        </Link>

        <Link href="/dashboard/cars/new" style={styles.actionCard}>
          <span style={styles.actionIcon}>➕</span>
          <div>
            <h3 style={styles.actionTitle}>إضافة سيارة</h3>
            <p style={styles.actionDesc}>نشر إعلان سيارة جديد</p>
          </div>
        </Link>

        <Link href="/dashboard/settings" style={styles.actionCard}>
          <span style={styles.actionIcon}>⚙️</span>
          <div>
            <h3 style={styles.actionTitle}>إعدادات الموقع</h3>
            <p style={styles.actionDesc}>تخصيص إعدادات الموقع</p>
          </div>
        </Link>
      </div>

      {stats.pending > 0 && (
        <div style={styles.pendingSection}>
          <h2 style={styles.pendingTitle}>📋 الإعلانات المعلقة بانتظار الموافقة</h2>
          <p style={styles.pendingDesc}>هناك {stats.pending} إعلاناً في انتظار مراجعتك</p>
          <Link href="/dashboard/cars?filter=pending" style={styles.pendingButton}>
            مراجعة الإعلانات المعلقة ←
          </Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    direction: 'rtl' as const,
    fontFamily: 'sans-serif',
    padding: '20px',
  },
  header: {
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '5px 0 0 0',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIcon: {
    fontSize: '28px',
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  actionCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  actionIcon: {
    fontSize: '32px',
  },
  actionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    color: '#1e293b',
  },
  actionDesc: {
    fontSize: '12px',
    color: '#64748b',
    margin: '5px 0 0 0',
  },
  pendingSection: {
    backgroundColor: '#fef9c3',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #facc15',
  },
  pendingTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#854d0e',
  },
  pendingDesc: {
    fontSize: '14px',
    color: '#854d0e',
    margin: '0 0 15px 0',
  },
  pendingButton: {
    display: 'inline-block',
    backgroundColor: '#854d0e',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '15px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};
