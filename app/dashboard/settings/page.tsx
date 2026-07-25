'use client';

import { useState, useEffect } from 'react';

// ... باقي الـ interfaces ...

export default function SettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    western_union: { receiver_name: '', country: '', city: '', phone: '' },
    paypal: { email: '', merchant_id: '' },
    premium_plan: { price: 50, max_images: 10, duration_days: 30 },
    commercial_ad: { header_price: 100, footer_price: 75, duration_days: 30 },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('فشل في جلب الإعدادات');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      } else {
        setError(data.message || 'حدث خطأ في جلب الإعدادات');
      }
    } catch (err) {
      console.error('❌ خطأ في جلب الإعدادات:', err);
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // ... باقي الكود ...

  return (
    <div>
      <h1>⚙️ إعدادات الدفع والإعلانات</h1>
      {loading && <p>جاري تحميل الإعدادات...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
      {!loading && !error && (
        <form onSubmit={handleSubmit}>
          {/* ... نموذج الإعدادات ... */}
        </form>
      )}
    </div>
  );
}
