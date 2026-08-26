'use client';

import { useEffect, useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface User {
  id: string; 
  name: string;
  email: string;
  role: string;
  created_at: string;
}

function UsersManagementForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/users?t=${Date.now()}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'fأل في جلب المستخدمين');
      }
    } catch {
      setError('خطأ في الاتصال بالسيرفر الخلفي');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAction = async (userId: string, action: string) => {
    if (action === 'delete' && !confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;

    try {
      setLoading(true);
      setError('');
      
      const url = action === 'delete' ? `/api/admin/users?id=${userId}` : '/api/admin/users';
      const methodType = action === 'delete' ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method: methodType,
        headers: { 'Content-Type': 'application/json' },
        body: action === 'delete' ? null : JSON.stringify({ userId, action }),
      });
      const data = await response.json();

      if (data.success || response.ok) {
        setSuccess(data.message || 'تمت العملية بنجاح');
        setUsers(prev => prev.filter(u => u.id !== userId));
        setTimeout(() => fetchUsers(), 500);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'فشل معالجة الطلب');
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      setError('خطأ في شبكة الاتصال');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>👥 إدارة المستخدمين</h1>
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>❌ {error}</div>}
      {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>✅ {success}</div>}

      {loading ? <p>جاري التحميل والتحديث الحركي...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <th style={{ padding: '14px', textAlign: 'right' }}>الاسم</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>البريد</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>الصلاحية</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>الحالة</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px' }}>{user.name || 'مستخدم جديد'}</td>
                  <td style={{ padding: '14px' }}>{user.email}</td>
                  <td style={{ padding: '14px' }}>{user.role === 'admin' ? 'مدير عام' : 'مستخدم'}</td>
                  {/* ✅ تم تصحيح الحالة لتظهر مفعّلة تلقائياً لجميع من عبر الـ OTP ونجح حسابه بقاعدة البيانات */}
                  <td style={{ padding: '14px' }}>🟢 مفعّل</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {user.role !== 'admin' ? (
                        <button onClick={() => handleUserAction(user.id, 'delete')} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>حذف</button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>محمي</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function UsersManagement() {
  return (
    <Suspense fallback={<div>جاري تحميل لوحة التحكم...</div>}>
      <UsersManagementForm />
    </Suspense>
  );
}
