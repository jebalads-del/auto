'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    payment_methods: ['western_union', 'paypal'],
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
    maintenance_mode: false,
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
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>⚙️ إعدادات الموقع</h1>

      {message && (
        <div style={{ 
          backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#991b1b',
          padding: '10px', borderRadius: '8px', marginBottom: '15px' 
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              style={{ width: '20px', height: '20px' }}
            />
            <span style={{ fontWeight: 'bold' }}>🔧 تفعيل وضع الصيانة</span>
          </label>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>
            عند التفعيل، ستظهر رسالة "الموقع تحت الصيانة" للزوار
          </p>
        </div>

        <hr style={{ margin: '20px 0' }} />

        <h3 style={{ marginBottom: '15px' }}>💵 ويسترن يونيون</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>اسم المستلم</label>
          <input
            type="text"
            value={settings.western_union.receiver_name}
            onChange={(e) => setSettings({
              ...settings,
              western_union: { ...settings.western_union, receiver_name: e.target.value }
            })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="أدخل اسم المستلم"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>الدولة</label>
          <input
            type="text"
            value={settings.western_union.country}
            onChange={(e) => setSettings({
              ...settings,
              western_union: { ...settings.western_union, country: e.target.value }
            })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="الدولة"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>المدينة</label>
          <input
            type="text"
            value={settings.western_union.city}
            onChange={(e) => setSettings({
              ...settings,
              western_union: { ...settings.western_union, city: e.target.value }
            })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="المدينة"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>رقم الهاتف</label>
          <input
            type="text"
            value={settings.western_union.phone}
            onChange={(e) => setSettings({
              ...settings,
              western_union: { ...settings.western_union, phone: e.target.value }
            })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="رقم الهاتف"
          />
        </div>

        <hr style={{ margin: '20px 0' }} />

        <h3 style={{ marginBottom: '15px' }}>💳 باي بال</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>البريد الإلكتروني</label>
          <input
            type="email"
            value={settings.paypal.email}
            onChange={(e) => setSettings({
              ...settings,
              paypal: { ...settings.paypal, email: e.target.value }
            })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="paypal@example.com"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>معرف التاجر (Merchant ID)</label>
          <input
            type="text"
            value={settings.paypal.merchant_id}
            onChange={(e) => setSettings({
              ...settings,
              paypal: { ...settings.paypal, merchant_id: e.target.value }
            })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
            placeholder="معرف التاجر"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
