"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardClient() {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cars' | 'users' | 'payments' | 'settings'>('cars');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [westernUnionInfo, setWesternUnionInfo] = useState('');
  const [siteName, setSiteName] = useState('');

  const fetchCars = async () => {
    try {
      setCarsLoading(true);
      const res = await fetch('/api/cars?_=' + Date.now());
      const data = await res.json();
      if (data.success) setCars(data.cars || []);
    } catch (err) { console.error(err); } finally { setCarsLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/admin/users?_=' + Date.now());
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (err) { console.error(err); } finally { setUsersLoading(false); }
  };

  useEffect(() => { fetchCars(); fetchUsers(); }, []);

  const handleCarAction = async (carId: number, action: 'approve' | 'sold' | 'delete') => {
    if (!confirm('هل أنت متأكد من تنفيذ هذا الإجراء؟')) return;
    try {
      const res = await fetch('/api/admin/cars/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, action })
      });
      const data = await res.json();
      if (data.success) { alert(data.message || 'تم بنجاح'); fetchCars(); } else { alert('خطأ: ' + data.message); }
    } catch (err) { alert('خطأ في الاتصال بالسيرفر'); }
  };

  const handleUserAction = async (id: number, action: 'activate' | 'delete') => {
    if (action === 'delete') {
      if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
      try {
        const res = await fetch('/api/admin/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.success) { alert(data.message || 'تم الحذف'); fetchUsers(); }
      } catch (err) { alert('خطأ أثناء معالجة الحذف'); }
    } else { alert('✅ تم تفعيل حساب المستخدم بنجاح'); }
  };

  return (
    <div style={{ padding: '15px', direction: 'rtl', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px', fontSize: '20px' }}>🛠️ لوحة تحكم الإدارة الشاملة</h1>
      
      <div style={{ marginBottom: '20px', textAlign: 'left' }}>
        <button onClick={() => router.push('/dashboard/cars/new')} style={{ backgroundColor: '#ff9800', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>➕ إضافة إعلان سيارة جديد</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '8px', backgroundColor: activeTab === 'cars' ? '#2563eb' : '#fff', color: activeTab === 'cars' ? 'white' : '#475569' }}>🚗 السيارات ({cars.length})</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '8px', backgroundColor: activeTab === 'users' ? '#2563eb' : '#fff', color: activeTab === 'users' ? 'white' : '#475569' }}>👥 المستخدمين ({users.length})</button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '8px', backgroundColor: activeTab === 'payments' ? '#2563eb' : '#fff', color: activeTab === 'payments' ? 'white' : '#475569' }}>💳 خيارات الدفع</button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '8px', backgroundColor: activeTab === 'settings' ? '#2563eb' : '#fff', color: activeTab === 'settings' ? 'white' : '#475569' }}>⚙️ إعدادات الموقع</button>
      </div>

      {activeTab === 'cars' && (
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px' }}>
          <h4>📌 جميع إعلانات السيارات المعروضة والمعلقة</h4>
          {carsLoading ? <p>جاري التحميل...</p> : (
            <div style={{ display: 'grid', gap: '12px', marginTop: '10px' }}>
              {cars.length === 0 ? <p style={{color: '#94a3b8', textAlign: 'center'}}>لا توجد إعلانات حالياً.</p> : 
                cars.map((car: any) => (
                  <div key={car.id} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <h5 style={{ margin: '0 0 5px 0' }}>{car.title || 'سيارة'}</h5>
                    <p style={{ margin: '0', fontSize: '13px' }}>💰 السعر: <strong style={{color: '#2563eb'}}>{car.price} KWD</strong></p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b' }}>الحالة: <strong style={{color: car.status === 'approved' || car.status === 'active' ? 'green' : car.status === 'sold' ? 'blue' : 'orange'}}>{car.status}</strong></p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      {(car.status !== 'approved' && car.status !== 'active' && car.status !== 'sold') && (
                        <button onClick={() => handleCarAction(car.id, 'approve')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🟢 موافقة ونشر</button>
                      )}
                      {car.status !== 'sold' && (
                        <button onClick={() => handleCarAction(car.id, 'sold')} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>💰 تم البيع</button>
                      )}
                      <button onClick={() => handleCarAction(car.id, 'delete')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ حذف</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px' }}>
          <h4>📌 إدارة الحسابات</h4>
          {usersLoading ? <p>جاري التحميل...</p> : (
            <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
              {users.map((user: any) => {
                const isAdminAccount = user.email.toLowerCase().includes('admin') || user.name.toLowerCase().includes('admin');
                return (
                  <div key={user.id} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <h5 style={{ margin: '0' }}>👤 {user.name} {isAdminAccount && <span style={{backgroundColor: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px'}}>مسؤول</span>}</h5>
                      <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>📧 {user.email} | 📞 {user.phone}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleUserAction(user.id, 'activate')} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⚡ تفعيل</button>
                      {!isAdminAccount && (
                        <button onClick={() => handleUserAction(user.id, 'delete')} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ حذف الحساب</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
