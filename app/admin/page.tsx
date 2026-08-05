'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const isAdmin = Cookies.get('isAdmin') || localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError('فشل في جلب البيانات');
      }
    } catch (err) {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">لوحة تحكم المدير</h1>
      
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">👥 المستخدمين ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">لا يوجد مستخدمين</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-right">#</th>
                  <th className="p-2 border text-right">الاسم</th>
                  <th className="p-2 border text-right">البريد الإلكتروني</th>
                  <th className="p-2 border text-right">الهاتف</th>
                  <th className="p-2 border text-right">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any, i) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{user.name || '—'}</td>
                    <td className="p-2 border">{user.email || '—'}</td>
                    <td className="p-2 border">{user.phone || '—'}</td>
                    <td className="p-2 border">
                      {user.is_premium ? '⭐ Premium' : 'عادي'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
