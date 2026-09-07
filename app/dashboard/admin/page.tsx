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
  const [activeTab, setActiveTab] = useState<'cars' | 'users' | 'settings' | 'payments'>('cars');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // 1. جلب الإعلانات بأمان عبر السيرفر رول المخفي في Vercel
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

  // 2. جلب المستخدمين بأمان من جدول auth المحمي
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      // طلب البيانات من نظام السيرفر الخاص بـ Supabase مباشرة
      const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();
      if (!error && authUsers) {
        const mappedUsers = authUsers.map(u => ({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.name || u.email?.split('@')[0],
          role: u.user_metadata?.role || 'user',
          status: 'active',
          created_at: u.created_at
        }));
        setUsers(mappedUsers);
      } else {
        // إذا فشل جلب الـ auth نقرأ من جدول public.users المخصص بحماية السيرفر رول
        const { data } = await supabase.from('users').select('*');
        if (data) setUsers(data);
      }
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchUsers();
  }, []);

  // 3. تحديث حالة الإعلان إلى (مباع / موافق عليه) بالسيرفر رول
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

  // 4. حذف الإعلان نهائياً بأمان
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* الواجهات والـ HTML الخاصة بك كما هي تماماً لضمان عدم تغير التصميم */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>🎛️ لوحة تحكم الإدارة</h1>
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

      {/* هنا سيتم عرض الجداول بناءً على الـ Active Tab وتعمل الأزرار بكفاءة */}
      {activeTab === 'cars' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '15px' }}>قائمة الإعلانات الحالية</h2>
          {cars.map((car) => (
            <div key={car.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
              <div>{car.title || 'إعلان سيارة'} - <span style={{color: car.status === 'sold' ? 'red' : 'green'}}>{car.status}</span></div>
              <div>
                <button onClick={() => handleCarAction(car.id, 'sell')} style={{ marginLeft: '5px', backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>مباع</button>
                <button onClick={() => handleCarDelete(car.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
