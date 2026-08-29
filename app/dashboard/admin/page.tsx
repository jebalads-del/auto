'use client';

import React, { useEffect, useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface Car {
  id: string;
  brand?: string;
  model?: string;
  title?: string;
  price: number;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function AdminDashboardForm() {
  const [cars, setCars] = useState<Car[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cars' | 'users'>('cars');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // 1. جلب السيارات حياً من السيرفر بشكل آمن ومحمي من الكراش
  const fetchCars = async () => {
    try {
      setCarsLoading(true);
      const res = await fetch('/api/cars?_=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setCars(data.cars || []);
      } else {
        console.error("فشل جلب السيارات:", data.message);
      }
    } catch (err) {
      console.error("خطأ في شبكة السيارات:", err);
    } finally {
      setCarsLoading(false);
    }
  };

  // 2. جلب المستخدمين حياً من السيرفر بشكل آمن
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/admin/users?_=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        console.error("فشل جلب المستخدمين:", data.message);
      }
    } catch (err) {
      console.error("خطأ في شبكة المستخدمين:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchUsers();
  }, []);

  // 3. معالجة أزرار السيارات الحركية (الموافقة / تغيير الحالة لمباع)
  const handleCarAction = async (carId: string, action: 'approve' | 'sell') => {
    const confirmMsg = action === 'approve' ? 'هل أنت متأكد من الموافقة على الإعلان؟' : 'هل تريد تحويل السيارة إلى مباعة؟';
    if (!confirm(confirmMsg)) return;
    
    try {
      setCarsLoading(true);
      const res = await fetch('/api/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, action })
      });
      const data = await res.json();
      if (data.success) {
        showMessage(data.message || 'تم تحديث حالة الإعلان بنجاح', 'success');
        fetchCars();
      } else {
        showMessage('حدث خطأ: ' + data.message, 'error');
      }
    } catch (err) {
      showMessage('خطأ في الاتصال بالسيرفر الخلفي', 'error');
    } finally {
      setCarsLoading(false);
    }
  };

  // 4. دالة حذف السيارات للأدمن
  const handleCarDelete = async (carId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      setCarsLoading(true);
      const res = await fetch(`/api/cars?id=${carId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showMessage('تم حذف الإعلان بنجاح', 'success');
        setCars(prev => prev.filter(c => c.id !== carId));
      } else {
        showMessage('فشل الحذف: ' + data.message, 'error');
      }
    } catch {
      showMessage('خطأ في شبكة الاتصال', 'error');
    } finally {
      setCarsLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', marginBottom: '25px', fontWeight: 'bold', color: '#1e293b' }}>🎛️ لوحة تحكم الإدارة العامة</h1>

      {message.text && (
        <div style={{ padding: '14px 20px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '15px', fontWeight: '500' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'cars' ? '#2563eb' : '#e2e8f0', color: activeTab === 'cars' ? 'white' : '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>🚗 إدارة الإعلانات ({cars.length})</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px 24px', backgroundColor: activeTab === 'users' ? '#2563eb' : '#e2e8f0', color: activeTab === 'users' ? 'white' : '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>👥 إدارة المستخدمين ({users.length})</button>
      </div>

      {activeTab === 'cars' ? (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {carsLoading ? <p style={{ padding: '20px', color: '#64748b' }}>جاري جلب إعلانات السيارات...</p> : cars.length === 0 ? <p style={{ padding: '20px', color: '#64748b' }}>لا توجد إعلانات سيارات متوفرة حالياً.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ padding: '14px', textAlign: 'right' }}>الإعلان</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>السعر</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>الحالة</th>
                  <th style={{ padding: '14px', textAlign: 'center' }}>التحكم الإداري</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px', fontWeight: '500' }}>{car.title || `${car.brand} ${car.model}`}</td>
                    <td style={{ padding: '14px', color: '#16a34a', fontWeight: '600' }}>{car.price} د.ك</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', backgroundColor: car.status === 'مقبول' ? '#d1fae5' : car.status === 'مباع' ? '#f3f4f6' : '#fef3c7', color: car.status === 'مقبول' ? '#065f46' : car.status === 'مباع' ? '#374151' : '#d97706' }}>
                        {car.status || 'قيد الانتظار'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {car.status !== 'مقبول' && car.status !== 'مباع' && (
                          <button onClick={() => handleCarAction(car.id, 'approve')} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>موافقة ونشر</button>
                        )}
                        {car.status === 'مقبول' && (
                          <button onClick={() => handleCarAction(car.id, 'sell')} style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>تحويل لمباع</button>
                        )}
                        <button onClick={() => handleCarDelete(car.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          {usersLoading ? <p style={{ padding: '20px', color: '#64748b' }}>جاري جلب قائمة المشتركين...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ padding: '14px', textAlign: 'right' }}>الاسم</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>البريد الإلكتروني</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>الصلاحية</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '14px' }}>{user.name || 'مستخدم جديد'}</td>
                    <td style={{ padding: '14px' }}>{user.email}</td>
                    <td style={{ padding: '14px' }}>{user.role === 'admin' ? 'مدير عام' : 'مستخدم'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div>جاري تحميل لوحة التحكم الذكية...</div>}>
      <AdminDashboardForm />
    </Suspense>
  );
}
