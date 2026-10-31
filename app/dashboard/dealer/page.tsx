'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function DealerDashboard() {
  const [loading, setLoading] = useState(true);
  const [dealer, setDealer] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchDealerData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/login');

        // 1. جلب بيانات المعرض الخاص بالمستخدم الحالي
        const { data: dealerData, error: dealerError } = await supabase
          .from('dealers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (dealerError || !dealerData) {
          // إذا لم يقم بإنشاء معرض بعد، نوجهه لصفحة الإعداد
          return router.push('/dealer/setup');
        }

        setDealer(dealerData);

        // 2. جلب سيارات المعرض فقط
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*')
          .eq('dealer_id', dealerData.id);

        if (!carsError && carsData) {
          setCars(carsData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDealerData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '16px', color: '#64748b', fontWeight: 'bold' }}>جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '30px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* رأس لوحة التحكم */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
              {dealer?.name} 🏢
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              رابط المعرض التعريفي: <span style={{ color: '#2563eb', fontWeight: 'bold' }}>sayarty.store/dealers/{dealer?.slug}</span>
            </p>
          </div>
          <div>
            <span style={{ 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              backgroundColor: dealer?.is_verified ? '#dcfce7' : '#fef9c3',
              color: dealer?.is_verified ? '#15803d' : '#a16207'
            }}>
              {dealer?.is_verified ? 'معرض موثق ✓' : 'بانتظار توثيق الإدارة ⏳'}
            </span>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>إجمالي السيارات المعروضة</p>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{cars.length}</h3>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>رقم السجل التجاري</p>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{dealer?.cr_number || 'غير متوفر'}</h3>
          </div>
        </div>

        {/* قسم سيارات المعرض */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>سيارات المعرض</h2>
            <button 
              onClick={() => router.push('/dashboard/cars/new')} // 👈 تم تصحيح الرابط هنا ليطابق مسار صفحة النشر لديك
              style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + إضافة سيارة جديدة
            </button>
          </div>

          {cars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <p style={{ fontSize: '15px', marginBottom: '10px' }}>لا توجد سيارات مضافة حتى الآن في معرضكم.</p>
              <p style={{ fontSize: '13px' }}>ابدأ بإضافة أول سيارة لتعرض للعملاء مباشرة!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {cars.map((car) => (
                <div key={car.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px', backgroundColor: '#fff' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '5px' }}>{car.title || car.model || 'سيارة بدون عنوان'}</h3>
                  <p style={{ fontSize: '14px', color: '#2563eb', fontWeight: 'bold' }}>{car.price ? `${car.price} ريال` : 'السعر عند الاتصال'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
