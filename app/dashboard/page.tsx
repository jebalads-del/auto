'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [cars, setCars] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cars');

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 جلب البيانات...');
      
      // جلب الإعلانات
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (carsError) {
        console.error('❌ Cars Error:', carsError);
      } else {
        console.log('✅ Cars:', carsData?.length || 0);
        setCars(carsData || []);
      }

      // جلب المستخدمين
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usersError) {
        console.error('❌ Users Error:', usersError);
      } else {
        console.log('✅ Users:', usersData?.length || 0);
        setUsers(usersData || []);
      }

    } catch (err) {
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // موافقة على الإعلان
  const handleApprove = async (carId: string) => {
    await supabase.from('cars').update({ status: 'approved' }).eq('id', carId);
    fetchData();
  };

  // حذف الإعلان
  const handleDelete = async (carId: string) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
      await supabase.from('cars').delete().eq('id', carId);
      fetchData();
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '15px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold' }}>🎛️ لوحة تحكم الإدارة</h1>
        <button onClick={handleLogout} style={{ padding: '8px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>🚪 خروج</button>
      </div>

      {/* الأزرار */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '12px', backgroundColor: activeTab === 'cars' ? '#2563eb' : 'white', color: activeTab === 'cars' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          🚗 الإعلانات ({cars.length})
        </button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px', backgroundColor: activeTab === 'users' ? '#2563eb' : 'white', color: activeTab === 'users' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          👥 المستخدمين ({users.length})
        </button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '12px', backgroundColor: activeTab === 'settings' ? '#2563eb' : 'white', color: activeTab === 'settings' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⚙️ الإعدادات
        </button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '12px', backgroundColor: activeTab === 'payments' ? '#2563eb' : 'white', color: activeTab === 'payments' ? 'white' : '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          💰 الدفع
        </button>
        <button onClick={() => router.push('/dashboard/cars/new')} style={{ gridColumn: 'span 2', padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
          ➕ إضافة إعلان جديد
        </button>
      </div>

      {/* المحتوى */}
      {loading ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
          ⏳ جاري التحميل...
        </div>
      ) : (
        <>
          {activeTab === 'cars' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px' }}>
              <h3 style={{ marginBottom: '15px' }}>🚗 قائمة الإعلانات ({cars.length})</h3>
              {cars.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>📭 لا توجد إعلانات</p>
              ) : (
                cars.map((car: any) => (
                  <div key={car.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <strong>{car.brand || 'سيارة'} {car.model || ''}</strong>
                      <br />
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{car.price} د.ك</span>
                      <span style={{ marginRight: '10px', fontSize: '12px', backgroundColor: car.status === 'approved' ? '#d1fae5' : '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                        {car.status === 'approved' ? '✅ مقبول' : car.status === 'pending' ? '⏳ قيد المراجعة' : car.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                      {car.status !== 'approved' && (
                        <button onClick={() => handleApprove(car.id)} style={{ padding: '4px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          موافقة
                        </button>
                      )}
                      <button onClick={() => handleDelete(car.id)} style={{ padding: '4px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        حذف
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px' }}>
              <h3 style={{ marginBottom: '15px' }}>👥 قائمة المستخدمين ({users.length})</h3>
              {users.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>👤 لا يوجد مستخدمين</p>
              ) : (
                users.map((user: any) => (
                  <div key={user.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <strong>{user.name || 'مستخدم'}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</span>
                      <span style={{ marginRight: '10px', fontSize: '12px', backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                        {user.role === 'admin' ? '👑 أدمن' : '👤 مستخدم'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px' }}>
              <h3>⚙️ إعدادات الموقع</h3>
              <p style={{ color: '#64748b' }}>سيتم إضافتها قريباً</p>
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px' }}>
              <h3>💰 طرق الدفع</h3>
              <p style={{ color: '#64748b' }}>سيتم إضافتها قريباً</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
