'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const isAdmin = Cookies.get('isAdmin') || localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
      return;
    }
    
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{padding: '20px', textAlign: 'center'}}>جاري التحميل...</div>;
  }

  return (
    <div style={{direction: 'rtl', padding: '20px', maxWidth: '1000px', margin: '0 auto'}}>
      <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '20px'}}>لوحة تحكم المدير</h1>
      
      <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px'}}>
        <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '16px'}}>👥 المستخدمين ({users.length})</h2>
        
        {users.length === 0 ? (
          <p style={{color: '#666'}}>لا يوجد مستخدمين</p>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f0f0f0'}}>
                  <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>#</th>
                  <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>الاسم</th>
                  <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>البريد</th>
                  <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>الهاتف</th>
                  <th style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any, i) => (
                  <tr key={user.id}>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{i + 1}</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{user.name || '—'}</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{user.email || '—'}</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{user.phone || '—'}</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>
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
