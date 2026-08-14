'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

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
    if (action === 'delete' && !confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;

    try {
      setLoading(true);
      setError('');
      
      // تم تعديل المسار والمنطق لتجنب خطأ شبكة الاتصال وتجربة المسار المباشر أو الإداري
      const url = action === 'delete' ? `/api/user/${userId}` : '/api/admin/users';
      const methodType = action === 'delete' ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method: methodType,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await response.json();

      if (data.success || response.ok) {
        setSuccess(data.message || 'تمت العملية بنجاح');
        // تحديث القائمة فورياً في الواجهة بشكل سريع
        setUsers(prev => prev.filter(u => u.id !== userId));
        setTimeout(() => fetchUsers(), 500);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'فشل معالجة الطلب');
        setTimeout(() => setError(''), 4000);
      }
    } catch {
      // إذا فشل الـ DELETE المباشر، نجرب كتابة المحاولة البديلة عبر مسار الإدارة العام
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action })
        });
        if (response.ok) {
          setSuccess('تمت العملية بنجاح');
          setTimeout(() => fetchUsers(), 500);
          return;
        }
      } catch {}
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
                  <td style={{ padding: '14px' }}>{user.name}</td>
                  <td style={{ padding: '14px' }}>{user.email}</td>
                  <td style={{ padding: '14px' }}>{user.role === 'admin' ? 'مدير عام' : 'مستخدم'}</td>
                  <td style={{ padding: '14px' }}>{user.status === 'active' ? '🟢 مفعّل' : '🔴 معطل'}</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {user.status !== 'active' && <button onClick={() => handleUserAction(user.id, 'activate')} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px' }}>تفعيل</button>}
                      {user.status === 'active' && user.role !== 'admin' && <button onClick={() => handleUserAction(user.id, 'deactivate')} style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px' }}>تعطيل</button>}
                      {user.role !== 'admin' && <button onClick={() => handleUserAction(user.id, 'delete')} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px' }}>حذف</button>}
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
