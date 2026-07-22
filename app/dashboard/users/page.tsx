'use client';

import { useEffect, useState } from 'react';

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
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setError('فشل في جلب المستخدمين');
      }
    } catch {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: string) => {
    if (action === 'delete' && !confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch {
      setError('حدث خطأ أثناء تنفيذ الإجراء');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>👥 إدارة المستخدمين</h1>

      {error && (
        <div style={{ backgroundColor: '#fee', color: '#c33', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#efe', color: '#3c3', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
          ✅ {success}
        </div>
      )}

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'right' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الاسم</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>البريد</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الدور</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>الحالة</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>تاريخ التسجيل</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{index + 1}</td>
                  <td style={{ padding: '12px' }}>{user.name}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: user.role === 'admin' ? '#fef3c7' : '#dbeafe',
                      color: user.role === 'admin' ? '#92400e' : '#1e40af',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: user.status === 'active' ? '#d1fae5' : '#fee2e2',
                      color: user.status === 'active' ? '#065f46' : '#991b1b',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {user.status === 'active' ? '🟢 مفعّل' : '🔴 غير مفعّل'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{formatDate(user.created_at)}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          تفعيل
                        </button>
                      )}
                      {user.status !== 'inactive' && user.role !== 'admin' && (
                        <button
                          onClick={() => handleUserAction(user.id, 'deactivate')}
                          style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          إيقاف
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              لا يوجد مستخدمين مسجلين حتى الآن
            </p>
          )}
        </div>
      )}
    </div>
  );
}
