'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = searchParams.get('carId');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'western' | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({
    adminName: 'احمد', adminCountry: 'الكويت', adminCity: 'الكويت',
    adminPhone: '555555', paypalEmail: 'mara7b@yahoo.com',
    merchantId: 'dixon316', featuredPrice: 10, featuredDuration: 30
  });

  useEffect(() => {
    fetch('/api/payment').then(res => res.ok && res.json()).then(data => {
      if (data && data.success) setSettings(data.settings);
    }).catch(e => console.error(e));
  }, []);

  const handleSubmit = async () => {
    if (!paymentMethod) return alert('⚠️ الرجاء اختيار طريقة الدفع أولاً!');
    setLoading(true);
    try {
      await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, paymentMethod, amount: settings.featuredPrice, type: 'featured' })
      });
      alert('🚀 تم إرسال طلب التمييز مع وسيلة الدفع للأدمن بنجاح!');
      router.push('/profile');
    } catch (e) {
      alert('❌ حدث خطأ في الشبكة.');
      router.push('/profile');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '500px', margin: '15px auto', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '18px', textAlign: 'center', marginBottom: '5px', color: '#0f172a', fontWeight: 'bold' }}>💳 إتمام طلب تمييز الإعلان</h1>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '15px' }}>رقم الإعلان: <strong style={{ color: '#2563eb' }}>#{carId || '---'}</strong></p>
        <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#db2777' }}>🏷️ تكلفة خدمة التمييز: </span>
          <strong style={{ fontSize: '18px', color: '#be185d' }}>{settings.featuredPrice} د.ك </strong>
          <span style={{ fontSize: '11px', color: '#db2777' }}>(لمدة {settings.featuredDuration} يوماً)</span>
        </div>
        <h3 style={{ fontSize: '13px', marginBottom: '10px', color: '#334155', fontWeight: 'bold' }}>🔒 اختر طريقة الدفع:</h3>
        <div onClick={() => setPaymentMethod('paypal')} style={{ display: 'flex', alignItems: 'flex-start', padding: '12px', border: paymentMethod === 'paypal' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', backgroundColor: paymentMethod === 'paypal' ? '#eff6ff' : 'white' }}>
          <input type="radio" checked={paymentMethod === 'paypal'} readOnly style={{ marginTop: '4px', marginLeft: '10px' }} />
          <div style={{ width: '100%' }}><strong style={{ fontSize: '13px', color: '#1e3a8a' }}>💰 PayPal</strong>
            {paymentMethod === 'paypal' && (
              <div style={{ marginTop: '5px', padding: '8px', backgroundColor: 'white', borderRadius: '6px', border: '1px dashed #bcd1f9', fontSize: '12px' }}>
                <p style={{ margin: '0 0 3px 0' }}>📧 الحساب: {settings.paypalEmail}</p>
                <p style={{ margin: 0 }}>🆔 التاجر: {settings.merchantId}</p>
              </div>
            )}
          </div>
        </div>
        <div onClick={() => setPaymentMethod('western')} style={{ display: 'flex', alignItems: 'flex-start', padding: '12px', border: paymentMethod === 'western' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px', cursor: 'pointer', backgroundColor: paymentMethod === 'western' ? '#eff6ff' : 'white' }}>
          <input type="radio" checked={paymentMethod === 'western'} readOnly style={{ marginTop: '4px', marginLeft: '10px' }} />
          <div style={{ width: '100%' }}><strong style={{ fontSize: '13px', color: '#15803d' }}>🏦 Western Union</strong>
            {paymentMethod === 'western' && (
              <div style={{ marginTop: '5px', padding: '8px', backgroundColor: 'white', borderRadius: '6px', border: '1px dashed #bbf7d0', fontSize: '12px', lineHeight: '1.4' }}>
                <p style={{ margin: '0 0 3px 0' }}>👤 المستلم: {settings.adminName}</p>
                <p style={{ margin: '0 0 3px 0' }}>📍 المكان: {settings.adminCountry} - {settings.adminCity}</p>
                <p style={{ margin: 0 }}>📞 الهاتف: {settings.adminPhone}</p>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', backgroundColor: '#059669', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
          {loading ? '⏳ جاري الإرسال...' : '✅ تأكيد الدفع وإرسال الطلب للأدمن'}
        </button>
        <Link href="/profile" style={{ display: 'block', textAlign: 'center', color: '#64748b', textDecoration: 'none', fontSize: '12px' }}>إلغاء والعودة للملف الشخصي</Link>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><p>⏳ جاري التحميل...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
