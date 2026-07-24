'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  phone: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setName(data.user.name || '');
        setPhone(data.user.phone || '');
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setMessage('');
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, phone }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('✅ تم تحديث الملف الشخصي بنجاح');
        setIsEditing(false);
        fetchUserData(); // تحديث البيانات
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch {
      setMessage('❌ حدث خطأ في الاتصال');
    }
  };

  if (loading) return <div style={styles.loading}>جاري التحميل...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 حسابي</h1>
        <Link href="/" style={styles.backLink}>← العودة للرئيسية</Link>
      </div>

      <div style={styles.card}>
        <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
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

      {/* ✅ نموذج تعديل الملف الشخصي */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>✏️ تعديل الملف الشخصي</h3>
        <div style={styles.editCard}>
          {message && <p style={{ color: message.includes('✅') ? 'green' : 'red', marginBottom: '10px' }}>{message}</p>}
          
          <div style={styles.field}>
            <label style={styles.label}>الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="الاسم الكامل"
              disabled={!isEditing}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>البريد الإلكتروني (غير قابل للتعديل)</label>
            <input
              type="email"
              value={user?.email || ''}
              style={{ ...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              disabled
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>📱 رقم الهاتف (للتواصل عبر واتساب)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              placeholder="مثال: 0501234567"
              disabled={!isEditing}
            />
          </div>

          <div style={styles.buttonGroup}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                ✏️ تعديل
              </button>
            ) : (
              <>
                <button onClick={handleUpdate} style={styles.saveBtn}>
                  💾 حفظ
                </button>
                <button onClick={() => { setIsEditing(false); setName(user?.name || ''); setPhone(user?.phone || ''); }} style={styles.cancelBtn}>
                  ❌ إلغاء
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* الاشتراك */}
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

      {/* إعلاناتي */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🚗 إعلاناتي</h3>
        <div style={styles.emptyState}>
          <p>لا توجد إعلانات حالياً</p>
          <Link href="/dashboard/cars/new" style={styles.addBtn}>
            ➕ نشر إعلان جديد
          </Link>
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
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    maxWidth: '800px',
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
  editCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  field: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#1e293b',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
    marginTop: '5px',
  },
  editBtn: {
    padding: '10px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 24px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
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
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center' as const,
    color: '#64748b',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
    textAlign: 'center' as const,
    padding: '50px',
    color: '#64748b',
  },
};
