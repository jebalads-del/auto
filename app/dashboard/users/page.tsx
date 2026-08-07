'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?t=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'فشل في جلب المستخدمين');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر الخلفي');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: string) => {
    const confirmMsg = action === 'delete' ? 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟' : `هل تريد ${action === 'activate' ? 'تفعيل' : 'إيقاف'} هذا المستخدم؟`;
    if (!confirm(confirmMsg)) return;

    try {
      setLoading(true);
      setError('');
      
      // التعديل الجوهري: الإرسال للمسار الموحد الصحيح
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => fetchUsers(), 500);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'فشل السيرفر في معالجة طلبك');
        setLoading(false);
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      setError('خطأ في شبكة الاتصال البرمجية');
      setLoading(false);
      setTimeout(() => setError(''), 4000);
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '---';
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#1e293b' }}>👥 إدارة المستخدمين</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>❌ {error}</div>}
      {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold' }}>✅ {success}</div>}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>جاري معالجة وتحديث البيانات الحية لقاعدة بيانات Neon...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <th style={{ padding: '14px', textAlign: 'right' }}>#</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>الاسم</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>البريد الإلكتروني</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>الصلاحية</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>الحالة</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>تاريخ التسجيل</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>الإجراءات المتوفرة</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px' }}>{index + 1}</td>
                  <td style={{ padding: '14px', fontWeight: '500' }}>{user.name}</td>
                  <td style={{ padding: '14px', color: '#475569' }}>{user.email}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ backgroundColor: user.role === 'admin' ? '#fef3c7' : '#dbeafe', color: user.role === 'admin' ? '#92400e' : '#1e40af', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {user.role === 'admin' ? 'مدير عام' : 'مستخدم'}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ backgroundColor: user.status === 'active' ? '#d1fae5' : '#fee2e2', color: user.status === 'active' ? '#065f46' : '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {user.status === 'active' ? '🟢 مفعّل' : '🔴 معطل'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#64748b' }}>{formatDate(user.created_at)}</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {user.status !== 'active' && (
                        <button onClick={() => handleUserAction(user.id, 'activate')} style={{ padding: '6px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>تفعيل</button>
                      )}
                      {user.status === 'active' && user.role !== 'admin' && (
                        <button onClick={() => handleUserAction(user.id, 'deactivate')} style={{ padding: '6px 14px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>تعطيل</button>
                      )}
                      {user.role !== 'admin' && (
                        <button onClick={() => handleUserAction(user.id, 'delete')} style={{ padding: '6px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>حذف نهائي</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b', backgroundColor: '#fff', borderRadius: '12px' }}>لا يوجد مستخدمين مسجلين في النظام حالياً.</p>
          )}
        </div>
      )}
    </div>
  );
}

