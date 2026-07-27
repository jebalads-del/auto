'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

// مكون منفصل يستخدم useSearchParams
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const position = searchParams.get('position') || 'header';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('western_union');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setMessage('');

    try {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      if (!userId) {
        setMessage('❌ يرجى تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/commercial-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          position: position,
          image: '',
          link_url: '',
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage('✅ تم إرسال طلب الإعلان بنجاح، في انتظار موافقة الأدمن');
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch {
      setMessage('❌ حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💳 دفع الإعلان التجاري</h1>
      <p style={styles.subtitle}>اختر طريقة الدفع المناسبة</p>

      {message && (
        <div style={{
          backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#991b1b',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '15px',
          textAlign: 'center',
        }}>
          {message}
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📌 تفاصيل الإعلان</h3>
        <p><strong>الموقع:</strong> {position === 'header' ? 'الهيدر' : 'الفوتر'}</p>
        <p><strong>السعر:</strong> ${settings?.commercial_ad?.[position === 'header' ? 'header_price' : 'footer_price'] || 100}</p>
        <p><strong>المدة:</strong> {settings?.commercial_ad?.duration_days || 30} يوم</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💳 طريقة الدفع</h3>
        <div style={styles.paymentOptions}>
          <label style={styles.paymentOption}>
            <input
              type="radio"
              value="western_union"
              checked={paymentMethod === 'western_union'}
              onChange={() => setPaymentMethod('western_union')}
            />
            💵 ويسترن يونيون
            {settings?.western_union && (
              <div style={styles.paymentDetails}>
                <p>اسم المستلم: {settings.western_union.receiver_name}</p>
                <p>الدولة: {settings.western_union.country}</p>
                <p>المدينة: {settings.western_union.city}</p>
                <p>الهاتف: {settings.western_union.phone}</p>
              </div>
            )}
          </label>
          <label style={styles.paymentOption}>
            <input
              type="radio"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={() => setPaymentMethod('paypal')}
            />
            💳 باي بال
            {settings?.paypal && (
              <div style={styles.paymentDetails}>
                <p>البريد: {settings.paypal.email}</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={styles.submitBtn}
      >
        {loading ? 'جاري الإرسال...' : '📤 إرسال طلب الإعلان'}
      </button>

      <Link href="/profile" style={styles.backLink}>← العودة للملف الشخصي</Link>
    </div>
  );
}

// المكون الرئيسي مع Suspense
export default function CommercialAdPayment() {
  return (
    <Suspense fallback={<div style={styles.container}><h1 style={styles.title}>جاري التحميل...</h1></div>}>
      <PaymentContent />
    </Suspense>
  );
}

const styles = {
  container: {
    direction: 'rtl' as const,
    padding: '20px',
    fontFamily: 'sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px',
    color: '#1e293b',
    textAlign: 'center' as const,
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#64748b',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '16px',
    marginBottom: '10px',
    color: '#1e293b',
  },
  paymentOptions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  paymentOption: {
    padding: '15px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  paymentDetails: {
    fontSize: '14px',
    color: '#64748b',
    paddingRight: '25px',
    marginTop: '5px',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  backLink: {
    display: 'block',
    textAlign: 'center' as const,
    marginTop: '15px',
    color: '#2563eb',
    textDecoration: 'none',
  },
};
