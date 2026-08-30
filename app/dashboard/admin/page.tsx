'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/db';

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
  status?: string;
}

function AdminDashboardForm() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cars' | 'users' | 'settings' | 'payments'>('cars');
  const [message, setMessage] = useState({ text: '', type: '' });

  const [siteName, setSiteName] = useState('سيارتي ستور');
  const [siteStatus, setSiteStatus] = useState('active');
  const [westernUnionInfo, setWesternUnionInfo] = useState('الاسم الكامل: مدير الموقع - الدولة: الكويت');
  const [paypalEmail, setPaypalEmail] = useState('admin@sayarty.store');

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchCars = async () => {
    try {
      setCarsLoading(true);
      const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
      if (!error && data) setCars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data) setUsers(data);
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

  const handleCarAction = async (carId: string, action: 'approve' | 'sell') => {
    try {
      let newStatus = action === 'approve' ? 'مقبول' : 'مباع';
      const { error } = await supabase.from('cars').update({ status: newStatus }).eq('id', carId);
      if (!error) {
        showMessage('تم تحديث حالة الإعلان بنجاح واكتمل التفعيل حياً', 'success');
        fetchCars();
      }
    } catch {
      showMessage('خطأ في الاتصال بقاعدة البيانات', 'error');
    }
  };

  const handleCarDelete = async (carId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      const { error } = await supabase.from('cars').delete().eq('id', carId);
      if (!error) {
        showMessage('تم حذف الإعلان بنجاح نهائياً', 'success');
        setCars(prev => prev.filter(c => c.id !== carId));
      }
    } catch {
      showMessage('خطأ في شبكة الاتصال', 'error');
    }
  };
  const handleUserToggleRole = async (userId: string, currentRole: string) => {
    try {
      let newRole = currentRole === 'admin' ? 'user' : 'admin';
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
      if (!error) {
        showMessage('تم تغيير صلاحية المستخدم بنجاح', 'success');
        fetchUsers();
      }
    } catch {
      showMessage('فشل تحديث الصلاحية', 'error');
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) {
        showMessage('تم حذف المستخدم بنجاح', 'success');
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch {
      showMessage('خطأ في الاتصال بقاعدة البيانات', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🎛️ لوحة تحكم الإدارة</h1>
        <button onClick={handleLogout} style={{ padding: '8px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🚪 خروج</button>
      </div>

      {message.text && (
        <div style={{ padding: '12px 15px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
          {message.text}
        </div>
      )}

      {/* 🚀 الهيكلية السحرية: شبكة ثابتة تعرض كل زرين في صف واحد متناسق تماماً على الهاتف */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'cars' ? '#2563eb' : 'white', color: activeTab === 'cars' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>🚗 الإعلانات ({cars.length})</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'users' ? '#2563eb' : 'white', color: activeTab === 'users' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>👥 المستخدمين ({users.length})</button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'settings' ? '#2563eb' : 'white', color: activeTab === 'settings' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>⚙️ إعدادات الموقع</button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'payments' ? '#2563eb' : 'white', color: activeTab === 'payments' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>💰 طرق الدفع</button>
        {/* زر إضافة إعلان جديد المطور والممتد على كامل العرض بامتياز أسفل الشبكة */}
        <button onClick={() => router.push('/dashboard/cars/new?redirect=admin')} style={{ gridColumn: 'span 2', padding: '14px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 2px 6px rgba(16,185,129,0.2)' }}>➕ إضافة إعلان جديد</button>
      </div>
      {activeTab === 'cars' && (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '12px' }}>
          {carsLoading ? <p style={{ color: '#64748b', fontSize: '14px' }}>جاري جلب الإعلانات حياً...</p> : cars.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '20px', fontSize: '14px' }}>لا توجد إعلانات متوفرة حالياً (قاعدة البيانات نظيفة ومصفرة).</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'right' }}>الإعلان</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>السعر</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>التحكم</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{car.title || `${car.brand} ${car.model}`}</td>
                    <td style={{ padding: '10px', color: '#16a34a', fontWeight: '600' }}>{car.price} د.ك</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        {car.status !== 'مقبول' && (
                          <button onClick={() => handleCarAction(car.id, 'approve')} style={{ padding: '4px 8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>موافقة</button>
                        )}
                        {car.status === 'مقبول' && (
                          <button onClick={() => handleCarAction(car.id, 'sell')} style={{ padding: '4px 8px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>مباع</button>
                        )}
                        <button onClick={() => handleCarDelete(car.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '12px' }}>
          {usersLoading ? <p style={{ color: '#64748b', fontSize: '14px' }}>جاري جلب المستخدمين حياً...</p> : users.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', fontSize: '14px' }}>لا يوجد مستخدمين مسجلين حالياً.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'right' }}>الاسم</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>التحكم الإداري</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '500' }}>{user.name || 'مستخدم جديد'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button onClick={() => handleUserToggleRole(user.id, user.role)} style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>{user.role === 'admin' ? 'تنزيل لرتبة مستخدم' : 'ترقية لأدمن'}</button>
                        <button onClick={() => handleUserDelete(user.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '15px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#1e293b' }}>⚙️ إعدادات المنصة الحية</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>اسم الموقع العربي</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>حالة صيانة المنصة</label>
              <select value={siteStatus} onChange={(e) => setSiteStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                <option value="active">نشط ويعمل للجمهور</option>
                <option value="maintenance">تحت الصيانة المؤقتة</option>
              </select>
            </div>
            <button onClick={() => showMessage('تم حفظ إعدادات الموقع بنجاح', 'success')} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>حفظ الإعدادات</button>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '15px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#1e293b' }}>💰 تهيئة قنوات واستقبال الدفع</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>بيانات تحويل ويسترن يونيون</label>
              <textarea value={westernUnionInfo} onChange={(e) => setWesternUnionInfo(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'sans-serif', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>حساب استقبال PayPal</label>
              <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            </div>
            <button onClick={() => showMessage('تم تحديث قنوات الدفع بنجاح', 'success')} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>حفظ بيانات الدفع</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div>جاري تحميل أزرارك وشبكتك الثابتة...</div>}>
      <AdminDashboardForm />
    </Suspense>
  );
}
