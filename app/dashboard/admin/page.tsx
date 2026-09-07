'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Car {
  id: string;
  brand?: string;
  model?: string;
  title?: string;
  price: number;
  status: string;
  created_at: string;
  year?: number;
  currency?: string;
  images?: string[];
  user_id?: string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  created_at?: string;
}

export default function AdminDashboardForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
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

  const fetchCars = async () => {
    try {
      setCarsLoading(true);
      const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
      if (!error) setCars(data || []);
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
      if (!error) setUsers(data || []);
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
      let newStatus = action === 'approve' ? 'approved' : 'sold';
      const { error } = await supabase.from('cars').update({ status: newStatus }).eq('id', carId);
      if (!error) {
        showMessage('✅ تم تحديث حالة الإعلان بنجاح', 'success');
        fetchCars();
      } else {
        showMessage('❌ فشل تحديث حالة الإعلان', 'error');
      }
    } catch {
      showMessage('❌ خطأ في الاتصال', 'error');
    }
  };

  const handleCarDelete = async (carId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      const { error } = await supabase.from('cars').delete().eq('id', carId);
      if (!error) {
        showMessage('🗑️ تم حذف الإعلان بنجاح', 'success');
        fetchCars();
      } else {
        showMessage('❌ فشل الحذف', 'error');
      }
    } catch {
      showMessage('❌ خطأ في الاتصال', 'error');
    }
  };

  const handleUserDelete = async (userId: string, userEmail: string) => {
    if (userEmail === 'admin@sayarty.store') return; // حماية إضافية في الكود
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) {
        showMessage('🗑️ تم حذف المستخدم بنجاح', 'success');
        fetchUsers();
      } else {
        showMessage('❌ فشل حذف المستخدم', 'error');
      }
    } catch {
      showMessage('❌ خطأ في الاتصال', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🎛️ لوحة تحكم الإدارة الاحترافية</h1>
        <button onClick={handleLogout} style={{ padding: '8px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🚪 خروج</button>
      </div>

      {message.text && (
        <div style={{ padding: '12px 15px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'cars' ? '#2563eb' : 'white', color: activeTab === 'cars' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          🚗 الإعلانات ({cars.length})
        </button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'users' ? '#2563eb' : 'white', color: activeTab === 'users' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          👥 المستخدمين ({users.length})
        </button>
      </div>

      {activeTab === 'cars' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>قائمة السيارات والمعاينة</h2>
          {carsLoading ? <p>جاري تحميل السيارات...</p> : cars.map((car) => (
            <div key={car.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5px', borderBottom: '1px solid #e2e8f0', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {car.images && car.images[0] ? (
                  <img src={car.images[0]} alt="car" style={{ width: '70px', height: '50px', borderRadius: '6px', objectFit: 'cover', backgroundColor: '#e2e8f0' }} />
                ) : (
                  <div style={{ width: '70px', height: '50px', borderRadius: '6px', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#475569' }}>بلا صورة</div>
                )}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{car.brand} {car.model} {car.year ? `(${car.year})` : ''}</div>
                  <div style={{ fontSize: '13px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>{car.price} {car.currency || 'KWD'}</div>
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '8px', backgroundColor: car.status === 'sold' ? '#fee2e2' : '#d1fae5', color: car.status === 'sold' ? '#dc2626' : '#065f46', inlineSize: 'fit-content', display: 'inline-block', marginTop: '4px' }}>
                    {car.status === 'sold' ? 'مباع' : 'نشط'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                {car.status !== 'sold' && (
                  <button onClick={() => handleCarAction(car.id, 'sell')} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>تحويل لمباع</button>
                )}
                <button onClick={() => handleCarDelete(car.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>حذف الإعلان</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>إدارة الحسابات</h2>
          {usersLoading ? <p>جاري تحميل المستخدمين...</p> : users.map((user) => (
            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 5px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user.name || 'مستخدم جديد'}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{user.email}</div>
                {user.email === 'admin@sayarty.store' && (
                  <span style={{ fontSize: '11px', color: '#2563eb', backgroundColor: '#dbeafe', padding: '1px 6px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' }}>المدير العام المحمي 👑</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {user.email !== 'admin@sayarty.store' ? (
                  <button onClick={() => handleUserDelete(user.id, user.email || '') style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>حذف الحساب</button>
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', padding: '6px' }}>غير قابل للتعديل</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
