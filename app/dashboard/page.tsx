'use client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📊 لوحة التحكم</h1>
        <button 
          onClick={handleLogout} 
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          🚪 تسجيل خروج
        </button>
      </div>
      {/* ... باقي المحتوى ... */}
    </div>
  );
}
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cars: 0,
    users: 0,
    ads: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('خطأ في جلب الإحصائيات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ 
        backgroundColor: '#1e293b', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>لوحة التحكم</h1>
        <p style={{ color: '#94a3b8' }}>مرحباً بك في لوحة تحكم سيارتي</p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        flexWrap: 'wrap' 
      }}>
        <Link href="/dashboard" style={{ 
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          الرئيسية
        </Link>
        
        <Link href="/dashboard/users" style={{ 
          backgroundColor: '#8b5cf6', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          المستخدمين
        </Link>
        
        <Link href="/dashboard/cars" style={{ 
          backgroundColor: '#059669', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          الاعلانات
        </Link>
        
        <Link href="/dashboard/settings" style={{ 
          backgroundColor: '#6b7280', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          الاعدادات
        </Link>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>
            {loading ? '...' : stats.cars}
          </div>
          <div style={{ color: '#64748b' }}>السيارات</div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
            {loading ? '...' : stats.users}
          </div>
          <div style={{ color: '#64748b' }}>المستخدمين</div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d97706' }}>
            {loading ? '...' : stats.ads}
          </div>
          <div style={{ color: '#64748b' }}>الاعلانات</div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>اجراءات سريعة</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/dashboard/cars/new" style={{ 
            backgroundColor: '#2563eb', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            اضافة سيارة جديدة
          </Link>
          <Link href="/dashboard/users" style={{ 
            backgroundColor: '#8b5cf6', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ادارة المستخدمين
          </Link>
          <Link href="/dashboard/settings" style={{ 
            backgroundColor: '#6b7280', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            الاعدادات
          </Link>
        </div>
      </div>
    </div>
  );
}
