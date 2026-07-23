'use client';

import { useState, useEffect } from 'react';

interface PaymentSettings {
  western_union: {
    receiver_name: string;
    country: string;
    city: string;
    phone: string;
  };
  paypal: {
    email: string;
    merchant_id: string;
  };
  premium_plan: {
    price: number;
    max_images: number;
    duration_days: number;
  };
  commercial_ad: {
    header_price: number;
    footer_price: number;
    duration_days: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    western_union: {
      receiver_name: '',
      country: '',
      city: '',
      phone: '',
    },
    paypal: {
      email: '',
      merchant_id: '',
    },
    premium_plan: {
      price: 50,
      max_images: 10,
      duration_days: 30,
    },
    commercial_ad: {
      header_price: 100,
      footer_price: 75,
      duration_days: 30,
    },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ تم حفظ الإعدادات بنجاح');
      } else {
        setMessage('❌ حدث خطأ في حفظ الإعدادات');
      }
    } catch {
      setMessage('❌ خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>⚙️ إعدادات الدفع والإعلانات</h1>

      {message && (
        <div style={{ 
          backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#991b1b',
          padding: '12px', borderRadius: '8px', marginBottom: '15px' 
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        
        <h3 style={{ marginBottom: '15px' }}>💵 ويسترن يونيون</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>اسم المستلم</label>
            <input
              type="text"
              value={settings.western_union.receiver_name}
              onChange={(e) => setSettings({
                ...settings,
                western_union: { ...settings.western_union, receiver_name: e.target.value }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الدولة</label>
            <input
              type="text"
              value={settings.western_union.country}
              onChange={(e) => setSettings({
                ...settings,
                western_union: { ...settings.western_union, country: e.target.value }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>المدينة</label>
            <input
              type="text"
              value={settings.western_union.city}
              onChange={(e) => setSettings({
                ...settings,
                western_union: { ...settings.western_union, city: e.target.value }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>رقم الهاتف</label>
            <input
              type="text"
              value={settings.western_union.phone}
              onChange={(e) => setSettings({
                ...settings,
                western_union: { ...settings.western_union, phone: e.target.value }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        <h3 style={{ marginBottom: '15px' }}>💳 باي بال</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>البريد الإلكتروني</label>
            <input
              type="email"
              value={settings.paypal.email}
              onChange={(e) => setSettings({
                ...settings,
                paypal: { ...settings.paypal, email: e.target.value }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>معرف التاجر</label>
            <input
              type="text"
              value={settings.paypal.merchant_id}
              onChange={(e) => setSettings({
                ...settings,
                paypal: { ...settings.paypal, merchant_id: e.target.value }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        <h3 style={{ marginBottom: '15px' }}>⭐ خطة الحساب المميز</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>السعر ($)</label>
            <input
              type="number"
              value={settings.premium_plan.price}
              onChange={(e) => setSettings({
                ...settings,
                premium_plan: { ...settings.premium_plan, price: parseFloat(e.target.value) }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>عدد الصور</label>
            <input
              type="number"
              value={settings.premium_plan.max_images}
              onChange={(e) => setSettings({
                ...settings,
                premium_plan: { ...settings.premium_plan, max_images: parseInt(e.target.value) }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>المدة (أيام)</label>
            <input
              type="number"
              value={settings.premium_plan.duration_days}
              onChange={(e) => setSettings({
                ...settings,
                premium_plan: { ...settings.premium_plan, duration_days: parseInt(e.target.value) }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
        </div>

        <hr style={{ margin: '20px 0' }} />

        <h3 style={{ marginBottom: '15px' }}>📢 الإعلانات التجارية</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>سعر إعلان الهيدر ($)</label>
            <input
              type="number"
              value={settings.commercial_ad.header_price}
              onChange={(e) => setSettings({
                ...settings,
                commercial_ad: { ...settings.commercial_ad, header_price: parseFloat(e.target.value) }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>سعر إعلان الفوتر ($)</label>
            <input
              type="number"
              value={settings.commercial_ad.footer_price}
              onChange={(e) => setSettings({
                ...settings,
                commercial_ad: { ...settings.commercial_ad, footer_price: parseFloat(e.target.value) }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>المدة (أيام)</label>
            <input
              type="number"
              value={settings.commercial_ad.duration_days}
              onChange={(e) => setSettings({
                ...settings,
                commercial_ad: { ...settings.commercial_ad, duration_days: parseInt(e.target.value) }
              })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
        >
          {loading ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
