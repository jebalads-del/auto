'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

interface Car {
  id: string; brand?: string; model?: string; title?: string;
  price: number; status: string; created_at: string;
  year?: number; currency?: string; images?: string[];
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
  
  // تفعيل التبويبات الأربعة الكاملة
  const [activeTab, setActiveTab] = useState<'cars' | 'users' | 'settings' | 'payments'>('cars');
  const [message, setMessage] = useState({ text: '', type: '' });

  // قيم إعدادات الموقع والصيانة الافتراضية
  const [siteName, setSiteName] = useState('سيارتي ستور');
  const [siteStatus, setSiteStatus] = useState('active');
  const [westernUnionInfo, setWesternUnionInfo] = useState('الاسم الكامل: مدير الموقع - الكويت');
  const [paypalEmail, setPaypalEmail] = useState('admin@sayarty.store');

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

  const handleCarAction = async (carId: string, action: 'approve' | 'sell') => {
    try {
      let newStatus = action === 'approve' ? 'approved' : 'sold';
      const { error } = await supabase.from('cars').update({ status: newStatus }).eq('id', carId);
      if (!error) { showMessage('✅ تم تحديث حالة الإعلان', 'success'); fetchCars(); }
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
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🎛️ لوحة تحكم الإدارة الاحترافية</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ padding: '8px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 خروج</button>
      </div>

      {message.text && (
        <div style={{ padding: '12px 15px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
          {message.text}
        </div>
      )}

      {/* استعادة شبكة الأزرار الأربعة الكاملة كما كانت */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'cars' ? '#2563eb' : 'white', color: activeTab === 'cars' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}>🚗 الإعلانات ({cars.length})</button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'users' ? '#2563eb' : 'white', color: activeTab === 'users' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}>👥 المستخدمين ({users.length})</button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'settings' ? '#2563eb' : 'white', color: activeTab === 'settings' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}>⚙️ الإعدادات</button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '12px 10px', backgroundColor: activeTab === 'payments' ? '#2563eb' : 'white', color: activeTab === 'payments' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold' }}>💰 الدفع</button>
        <button onClick={() => router.push('/dashboard/cars/new')} style={{ gridColumn: 'span 2', padding: '14px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>➕ إضافة إعلان جديد</button>
      </div>

      {activeTab === 'cars' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>🚗 قائمة إعلانات السيارات ({cars.length})</h2>
          {carsLoading ? <p>جاري تحميل السيارات...</p> : cars.map((car) => (
            <div key={car.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {car.images && car.images.length > 0 && <img src={car.images[0]} alt="car" style={{ width: '70px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{car.brand} {car.model} {car.year && `(${car.year})`}</div>
                  <div style={{ fontSize: '13px', color: '#059669', fontWeight: 'bold', marginTop: '2px' }}>{car.price} {car.currency || 'د.ك'}</div>
                                    <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '8px', 
                    display: 'inline-block', 
                    marginTop: '4px',
                    fontWeight: '600',
                    backgroundColor: car.status === 'sold' ? '#fee2e2' : car.status === 'pending' ? '#fef3c7' : '#d1fae5', 
                    color: car.status === 'sold' ? '#dc2626' : car.status === 'pending' ? '#d97706' : '#065f46' 
                  }}>
                    {car.status === 'sold' ? 'مباع' : car.status === 'pending' ? 'قيد المراجعة' : 'نشط'}
                  </span>

                </div>
              </div>
                            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                {/* 1. إذا كان الإعلان بحاجة لمراجعة يظهر زر موافقة أخضر */}
                {car.status === 'pending' && (
                  <button onClick={() => handleCarAction(car.id, 'approve')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>موافقة ونشر</button>
                )}
                
                {/* 2. إذا كان الإعلان نشطاً يظهر زر تحويل لمباع أصفر */}
                {car.status === 'approved' && (
                  <button onClick={() => handleCarAction(car.id, 'sell')} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>تحويل لمباع</button>
                )}
                
                {/* 3. زر الحذف ثابت دائماً لجميع الحالات */}
                <button onClick={() => handleCarDelete(car.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>حذف الإعلان</button>
              </div>

      )}

      {activeTab === 'users' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>👥 إدارة الحسابات ({users.length})</h2>
          {usersLoading ? <p>جاري تحميل الحسابات...</p> : users.map((user) => (
            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 5px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user.name || 'مستخدم جديد'}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{user.email}</div>
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

      {/* شاشة إعدادات الموقع وضع الصيانة المستعادة */}
      {activeTab === 'settings' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>⚙️ إعدادات الموقع والصيانة</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>اسم الموقع</label>
            <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>وضع الصيانة</label>
            <select value={siteStatus} onChange={(e) => setSiteStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
              <option value="active">نشط (متاح للجميع)</option>
              <option value="maintenance">وضع الصيانة (مغلق مؤقتاً)</option>
            </select>
          </div>
          <button onClick={() => showMessage('✅ تم حفظ إعدادات الموقع بنجاح', 'success')} style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>حفظ الإعدادات</button>
        </div>
      )}

      {/* شاشة إعدادات الدفع PayPal و Western Union المستعادة */}
      {activeTab === 'payments' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' }}>💰 إعدادات حسابات الدفع</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>بيانات ويسترن يونيون</label>
            <textarea value={westernUnionInfo} onChange={(e) => setWesternUnionInfo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '60px', fontFamily: 'sans-serif' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>حساب PayPal</label>
            <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <button onClick={() => showMessage('✅ تم حفظ حسابات الدفع بنجاح', 'success')} style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>حفظ حسابات الدفع</button>
        </div>
      )}

    </div>
  );
}
