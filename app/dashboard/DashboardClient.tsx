"use client";
import React, { useEffect, useState } from 'react';

export default function DashboardClient() {
  const [cars, setCars] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cars' | 'users'>('cars');

  const fetchCars = async () => {
    try {
      setCarsLoading(true);
      const res = await fetch('/api/cars?_=' + Date.now());
      const data = await res.json();
      if (data.success) setCars(data.cars || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCarsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/admin/users?_=' + Date.now());
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchUsers();
  }, []);

  const handleCarAction = async (carId: number, action: 'approve' | 'delete') => {
    if (!confirm(`هل أنت متأكد من تنفيذ هذا الإجراء على الإعلان؟`)) return;
    try {
      const res = await fetch('/api/admin/cars/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'تم الإجراء بنجاح');
        fetchCars();
      } else {
        alert('حدث خطأ: ' + data.message);
      }
    } catch (err) {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const handleUserDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'تم الحذف بنجاح');
        fetchUsers();
      } else {
        alert('فشل الحذف: ' + data.message);
      }
    } catch (err) {
      alert('خطأ أثناء معالجة الحذف');
    }
  };

  return (
    <div style={{ padding: '30px', direction: 'rtl', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '30px' }}>🛠️ لوحة تحكم الإدارة المطورة</h1>
      
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '6px', backgroundColor: activeTab === 'cars' ? '#3b82f6' : '#edf2f7', color: activeTab === 'cars' ? 'white' : '#4a5568' }}>🚗 إدارة السيارات ({cars.filter(c => c.status === 'pending').length})</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '6px', backgroundColor: activeTab === 'users' ? '#3b82f6' : '#edf2f7', color: activeTab === 'users' ? 'white' : '#4a5568' }}>👥 إدارة المستخدمين ({users.length})</button>
      </div>

      {activeTab === 'cars' && (
        <div>
          <h3>📌 الإعلانات المعلقة بانتظار الموافقة</h3>
          {carsLoading ? <p>جاري تحميل السيارات...</p> : (
            <div style={{ display: 'grid', gap: '20px', marginTop: '15px' }}>
              {cars.filter((c: any) => c.status === 'pending').length === 0 ? <p style={{color: '#718096'}}>لا توجد إعلانات معلقة حالياً.</p> : 
                cars.filter((c: any) => c.status === 'pending').map((car: any) => (
                  <div key={car.id} style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{car.title || 'سيارة بدون عنوان'}</h4>
                    <p style={{ margin: '5px 0', color: '#4a5568' }}>💰 السعر: <strong style={{color: '#2563eb'}}>{car.price} KWD</strong></p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button onClick={() => handleCarAction(car.id, 'approve')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🟢 موافقة ونشر</button>
                      <button onClick={() => handleCarAction(car.id, 'delete')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ حذف الإعلان</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3>📌 الحسابات المسجلة في الموقع</h3>
          {usersLoading ? <p>جاري تحميل المستخدمين...</p> : (
            <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
              {users.length === 0 ? <p style={{color: '#718096'}}>لا يوجد مستخدمون نشطون حالياً.</p> : 
                users.map((user: any) => (
                  <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <div>
                      <h5 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#1e293b' }}>👤 {user.name}</h5>
                      <p style={{ margin: '0', fontSize: '13px', color: '#718096' }}>📧 {user.email} | 📞 {user.phone}</p>
                    </div>
                    <button onClick={() => handleUserDelete(user.id)} style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '6px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ حذف الحساب</button>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}
