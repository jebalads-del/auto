'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Car {
  id: string; brand?: string; model?: string; title?: string;
  price: number; status: string; created_at: string;
  year?: number; currency?: string; images?: string[];
  is_featured?: boolean; featured_payment_ref?: string;
}

interface User {
  id: string; name?: string; email?: string; role?: string;
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
  
  const [activeTab, setActiveTab] = useState<'cars' | 'users' | 'settings' | 'featured_requests'>('cars');
  const [message, setMessage] = useState({ text: '', type: '' });

  const [siteName, setSiteName] = useState('سيارتي ستور');

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchCars = async () => {
    try {
      setCarsLoading(true);
      const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
      if (data) setCars(data);
    } catch { setCars([]); } finally { setCarsLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
    } catch { setUsers([]); } finally { setUsersLoading(false); }
  };

  useEffect(() => { fetchCars(); fetchUsers(); }, []);

  const handleCarAction = async (carId: string, action: 'approve' | 'sell' | 'approve_featured' | 'remove_featured') => {
    try {
      let updateData: any = {};
      if (action === 'approve') updateData = { status: 'approved' };
      if (action === 'sell') updateData = { status: 'sold' };
      if (action === 'approve_featured') updateData = { is_featured: true, status: 'approved' };
      if (action === 'remove_featured') updateData = { is_featured: false };

      const { error } = await supabase.from('cars').update(updateData).eq('id', carId);
      if (!error) { showMessage('✅ تم تحديث حالة الإعلان بنجاح', 'success'); fetchCars(); }
    } catch { showMessage('❌ خطأ في الاتصال', 'error'); }
  };

  const handleCarDelete = async (carId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    try {
      const { error } = await supabase.from('cars').delete().eq('id', carId);
      if (!error) { showMessage('🗑️ تم حذف الإعلان بنجاح', 'success'); fetchCars(); }
    } catch { showMessage('❌ خطأ في الاتصال', 'error'); }
  };

  const handleUserDelete = async (userId: string, userEmail: string) => {
    if (userEmail === 'admin@sayarty.store') return; 
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) { showMessage('🗑️ تم حذف المستخدم بنجاح', 'success'); fetchUsers(); }
    } catch { showMessage('❌ خطأ في الاتصال', 'error'); }
  };
  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🎛️ لوحة تحكم الإدارة</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ padding: '8px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 خروج</button>
      </div>

      {message.text && (
        <div style={{ padding: '12px 15px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'cars' ? '#2563eb' : 'white', color: activeTab === 'cars' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}>🚗 الإعلانات ({cars.length})</button>
        <button onClick={() => setActiveTab('featured_requests')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'featured_requests' ? '#eab308' : 'white', color: activeTab === 'featured_requests' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}>⭐ طلبات التمييز ({cars.filter(c => c.status === 'pending_featured').length})</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'users' ? '#2563eb' : 'white', color: activeTab === 'users' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}>👥 المستخدمين ({users.length})</button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'settings' ? '#2563eb' : 'white', color: activeTab === 'settings' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}>⚙️ الإعدادات</button>
      </div>

      {activeTab === 'cars' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>🚗 قائمة إعلانات السيارات</h2>
          {carsLoading ? <p>جاري تحميل السيارات...</p> : cars.map((car) => (
            <div key={car.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {car.images && car.images.length > 0 && <img src={car.images[0]} alt="car" style={{ width: '70px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{car.brand} {car.model} {car.year && `(${car.year})`}</div>
                  <div style={{ fontSize: '13px', color: '#059669', fontWeight: 'bold' }}>{car.price} {car.currency || 'د.ك'}</div>
                  
                  {/* ❌ زر إلغاء التميز التفاعلي السحري بدلاً من الكلمة الثابتة القديمة */}
                  {car.is_featured && (
                    <button 
                      onClick={() => handleCarAction(car.id, 'remove_featured')} 
                      style={{ fontSize: '11px', color: '#dc2626', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', marginTop: '5px', cursor: 'pointer' }}
                    >
                      ❌ إلغاء التميز
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                {car.status === 'pending' && (
                  <button onClick={() => handleCarAction(car.id, 'approve')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>موافقة ونشر</button>
                )}
                {car.status === 'approved' && (
                  <button onClick={() => handleCarAction(car.id, 'sell')} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>تحويل لمباع</button>
                )}
                <button onClick={() => handleCarDelete(car.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>حذف الإعلان</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'featured_requests' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold', color: '#eab308' }}>⭐ طلبات التمييز قيد الانتظار</h2>
          {cars.filter(c => c.status === 'pending_featured').length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>📬 لا توجد طلبات معلقة حالياً</p> : cars.filter(c => c.status === 'pending_featured').map((car) => (
            <div key={car.id} style={{ padding: '15px', border: '1px solid #f1f5f9', borderRadius: '10px', marginBottom: '10px', backgroundColor: '#fffdf5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold' }}>{car.brand} {car.model} ({car.year})</div>
                <div style={{ color: '#16a34a', fontWeight: 'bold' }}>{car.price} د.ك</div>
              </div>
              <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#d97706', marginBottom: '10px', border: '1px solid #fde68a' }}>
                <strong>💳 بيانات الحوالة المرسلة:</strong> {car.featured_payment_ref || 'لم يتم إدخال بيانات'}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => handleCarAction(car.id, 'approve_featured')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>⭐ موافقة وتثبيت كمميز</button>
                <button onClick={() => handleCarAction(car.id, 'approve')} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>رفض كلي</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>👥 إدارة الحسابات ({users.length})</h2>
          {usersLoading ? <p>جاري تحميل الحسابات...</p> : users.map((user) => (
            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 5px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user.name || 'مستخدم جديد'}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
              </div>
              {user.email !== 'admin@sayarty.store' ? (
                <button onClick={() => handleUserDelete(user.id, user.email || '')} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>حذف الحساب</button>
              ) : (
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '6px' }}>المدير 👑</span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>⚙️ إعدادات الموقع</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>اسم الموقع</label>
            <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <button onClick={() => showMessage('✅ تم حفظ الإعدادات بنجاح', 'success')} style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>حفظ</button>
        </div>
      )}

    </div>
  );
}
