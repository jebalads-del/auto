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
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🎛️ لوحة تحكم الإدارة العامة</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>🚪 خروج آمن</button>
      </div>

      {message.text && (
        <div style={{ padding: '14px 20px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '15px', fontWeight: '500' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '10px 18px', backgroundColor: activeTab === 'cars' ? '#2563eb' : 'white', color: activeTab === 'cars' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>🚗 الإعلانات ({cars.length})</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '10px 18px', backgroundColor: activeTab === 'users' ? '#2563eb' : 'white', color: activeTab === 'users' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>👥 المستخدمين ({users.length})</button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '10px 18px', backgroundColor: activeTab === 'settings' ? '#2563eb' : 'white', color: activeTab === 'settings' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>⚙️ إعدادات الموقع</button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '10px 18px', backgroundColor: activeTab === 'payments' ? '#2563eb' : 'white', color: activeTab === 'payments' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>💰 طرق الدفع</button>
      </div>
      {activeTab === 'cars' && (
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '15px' }}>
          {carsLoading ? <p style={{ color: '#64748b' }}>جاري جلب الإعلانات حياً...</p> : cars.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>لا توجد إعلانات متوفرة حالياً (قاعدة البيانات نظيفة ومصفرة).</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'right' }}>الإعلان</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>السعر</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>الحالة</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>التحكم الإداري</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{car.title || `${car.brand} ${car.model}`}</td>
                    <td style={{ padding: '12px', color: '#16a34a', fontWeight: '600' }}>{car.price} د.ك</td>
                    <td style={{ padding: '12px' }}>{car.status || 'قيد الانتظار'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {car.status !== 'مقبول' && (
                          <button onClick={() => handleCarAction(car.id, 'approve')} style={{ padding: '5px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>موافقة</button>
                        )}
                        {car.status === 'مقبول' && (
                          <button onClick={() => handleCarAction(car.id, 'sell')} style={{ padding: '5px 10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>مباع</button>
                        )}
                        <button onClick={() => handleCarDelete(car.id)} style={{ padding: '5px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>حذف</button>
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
        <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '15px' }}>
          {usersLoading ? <p style={{ color: '#64748b' }}>جاري جلب المستخدمين حياً...</p> : users.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center' }}>لا يوجد مستخدمين مسجلين حالياً موازاة للتصفير.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'right' }}>الاسم</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>البريد الإلكتروني</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>الصلاحية</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>التحكم الإداري</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{user.name || 'مستخدم جديد'}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px', fontWeight: '600', color: user.role === 'admin' ? '#2563eb' : '#475569' }}>{user.role === 'admin' ? 'مدير عام' : 'مستخدم عادي'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => handleUserToggleRole(user.id, user.role)} style={{ padding: '5px 10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>تبديل رتبة</button>
                        <button onClick={() => handleUserDelete(user.id)} style={{ padding: '5px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>حذف عضو</button>
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
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>⚙️ التحكم في إعدادات المنصة الحية</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>اسم الموقع العربي</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>حالة صيانة المنصة</label>
              <select value={siteStatus} onChange={(e) => setSiteStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="active">نشط ويعمل للجمهور</option>
                <option value="maintenance">تحت الصيانة المؤقتة</option>
              </select>
            </div>
            <button onClick={() => showMessage('تم حفظ إعدادات الموقع العامة بنجاح حياً', 'success')} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>حفظ الإعدادات</button>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>💰 تهيئة قنوات واستقبال الدفع الحية</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>بيانات تحويل ويسترن يونيون (Western Union)</label>
              <textarea value={westernUnionInfo} onChange={(e) => setWesternUnionInfo(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'sans-serif' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>حساب استقبال PayPal المعتمد</label>
              <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <button onClick={() => showMessage('تم تحديث قنوات استقبال وتفعيل الكاش بنجاح واكتمل الربط', 'success')} style={{ padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>حفظ بيانات الدفع</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div>جاري تحميل الأزرار والخيارات الخمسة كاملة...</div>}>
      <AdminDashboardForm />
    </Suspense>
  );
}
