'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SelectRolePage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUserStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type, role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin' || profile?.account_type === 'admin') {
          router.push('/dashboard/admin');
          return;
        }

        if (profile?.account_type) {
          if (profile.account_type === 'dealer') {
            router.push('/dashboard/dealer');
          } else {
            router.push('/');
          }
          return;
        }
      } catch (err) {
        console.error('Error checking user:', err);
      } finally {
        setChecking(false);
      }
    }

    checkUserStatus();
  }, [router, supabase]);

  const handleSelectRole = async (role: 'individual' | 'dealer') => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 🛠️ محاولة الحفظ مع طباعة الخطأ الحقيقي في حال فشل Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          account_type: role,
          dealer_status: role === 'dealer' ? 'pending' : 'none',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        console.error('Supabase Upsert Error:', error.message, error.details, error.hint);
        alert(`خطأ في قاعدة البيانات: ${error.message}`);
        setLoading(false);
        return;
      }

      if (role === 'dealer') {
        router.push('/dealer/setup');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: any) {
      console.error('Unexpected Error:', err);
      alert('حدث خطأ غير متوقع أثناء الاتصال.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#64748b', fontWeight: 'bold' }}>⏳ جاري التحقق من الحساب...</p>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>
          مرحباً بك في سيارتي ستور! 🚗
        </h1>
        <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '15px' }}>
          اختر نوع حسابك لنتمكن من تخصيص تجربتك بأفضل شكل ممكن:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          
          <div 
            onClick={() => !loading && handleSelectRole('individual')}
            style={{ border: '2px solid #e2e8f0', borderRadius: '12px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#fff' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>👤</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>حساب فردي</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
              مخصص لتصفح السيارات، البحث، وإضافة سيارتك الشخصية للبيع.
            </p>
          </div>

          <div 
            onClick={() => !loading && handleSelectRole('dealer')}
            style={{ border: '2px solid #e2e8f0', borderRadius: '12px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#fff' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏢</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>معرض / شركة</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
              احصل على لوحة تحكم لإدارة مخزونك، صفحة خاصة لمعرضك، ومميزات احترافية.
            </p>
          </div>

        </div>

        {loading && <p style={{ color: '#2563eb', fontWeight: 'bold', marginTop: '15px' }}>⏳ جاري حفظ اختيارك وتوجيهك...</p>}

      </div>
    </div>
  );
}
