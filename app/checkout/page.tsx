'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdminSettings {
  adminName?: string;
  adminCountry?: string;
  adminCity?: string;
  adminPhone?: string;
  paypalEmail?: string;
  merchantId?: string;
  featuredPrice?: number;
  featuredDuration?: number;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get('carId');

  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'western' | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const [settings, setSettings] = useState<AdminSettings>({
    adminName: 'احمد',
    adminCountry: 'الكويت',
    adminCity: 'الكويت',
    adminPhone: '555555',
    paypalEmail: 'mara7b@yahoo.com',
    merchantId: 'dixon316',
    featuredPrice: 10,
    featuredDuration: 30
  });

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Error fetching admin settings, using defaults:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchAdminSettings();
  }, []);

  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      alert('⚠️ الرجاء اختيار طريقة الدفع أولاً!');
      return;
    }
    setLoading(true);
    try {
      // تعديل المسار هنا ليتوافق مع مسار الـ API المتاح لديك في المشروع
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, paymentMethod, amount: settings.featuredPrice, type: 'featured' })
      });
      alert('🚀 تم إرسال طلب التمييز مع اختيار وسيلة الدفع للأدمن بنجاح! جاري المراجعة.');
      router.push('/profile');
    } catch (e) {
      console.error(e);
      alert('❌ حدث خطأ أثناء إرسال الطلب، تم إشعار الإدارة مبدئياً.');
      router.push('/profile');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '550px', margin: '20px auto', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        
        <h1 style={{ fontSize: '18px', textAlign: 'center', marginBottom: '5px', color: '#0f172a', fontWeight: 'bold' }}>💳 إتمام طلب تمييز الإعلان</h1>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>رقم الإعلان الحالي المراد تمييزه: <strong style={{ color: '#2563eb' }}>#{carId || '---'}</strong></p>

        <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '13px', color: '#db2777', display: 'block' }}>🏷️ تكلفة خدمة التمييز المنفرد</span>
          <strong style={{ fontSize: '20px', color: '#be185d' }}>{settings.featuredPrice} د.ك</strong>
          <span style={{ fontSize: '12px', color: '#db2777', display: 'block', marginTop: '2px' }}>مدة بقاء التمييز: {settings.featuredDuration} يوماً</span>
        </div>

        <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#334155', fontWeight: 'bold' }}>🔒 اختر طريقة الدفع لإرسال الطلب:</h3>

        <div 
          onClick={() => setPaymentMethod('paypal')}
          style={{ display: 'flex', alignItems: 'flex-start', padding: '15px', border: paymentMethod === 'paypal' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', cursor: 'pointer', backgroundColor: paymentMethod === 'paypal' ? '#eff6ff' : 'white' }}
        >
          <input type="radio" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} style={{ marginTop: '4px', marginLeft: '10px' }} />
          <div style={{ width: '100%' }}>
            <strong style={{ display: 'block', fontSize: '14px', color: '#1e3a8a' }}>💰 الدفع عبر PayPal</strong>
            {paymentMethod === 'paypal' && (
              <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px dashed #bcd1f9', fontSize: '13px', color: '#334155' }}>
                <p style={{ margin: '0 0 4px 0' }}>📧 حساب باي بال الإدارة: <strong>{settings.paypalEmail}</strong></p>
                <p style={{ margin: 0 }}>🆔 معرف التاجر: <strong>{settings.merchantId}</strong></p>
              </div>
            )}
          </div>
        </div>

        <div 
          onClick={() => setPaymentMethod('western')}
          style={{ display: 'flex', alignItems: 'flex-start', padding: '15px', border: paymentMethod === 'western' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px', cursor: 'pointer', backgroundColor: paymentMethod === 'western' ? '#eff6ff' : 'white' }}
        >
          <input type="radio" checked={paymentMethod === 'western'} onChange={() => setPaymentMethod('western')} style={{ marginTop: '4px', marginLeft: '10px' }} />
          <div style={{ width: '100%' }}>
            <strong style={{ display: 'block', fontSize: '14px', color: '#15803d' }}>🏦 حوالة عبر Western Union</strong>
            {paymentMethod === 'western' && (
              <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px dashed #bbf7d0', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                <p style={{ margin: '0 0 4px 0' }}>👤 اسم المستلم: <strong>{settings.adminName}</strong></p>
                <p style={{ margin: '0 0 4px 0' }}>📍 الدولة والمدينة: <strong>{settings.adminCountry} - {settings.adminCity}</strong></p>
                <p style={{ margin: 0 }}>📞 هاتف التواصل: <strong>{settings.adminPhone}</strong></p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleSubmitOrder}
          disabled={loading}
          style={{ width: '100%', backgroundColor: '#059669', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}
        >
          {loading ? '⏳ جاري إرسال الطلب...' : '✅ تأكيد الدفع وإرسال الطلب للأدمن'}
        </button>

        <Link href="/profile" style={{ display: 'block', textAlign: 'center', color: '#64748b', textDecoration: 'none', fontSize: '13px' }}>إلغاء والعودة للملف الشخصي</Link>

      </div>
    </div>
  );
}
