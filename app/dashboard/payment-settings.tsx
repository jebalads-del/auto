'use client';
import { useState, useEffect } from 'react';

export default function PaymentSettings() {
  const [paypalEmail, setPaypalEmail] = useState('');
  const [westernName, setWesternName] = useState('');
  const [westernCountry, setWesternCountry] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/payment')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPaypalEmail(data.paypal_email || '');
          setWesternName(data.western_name || '');
          setWesternCountry(data.western_country || '');
        }
      }).catch(err => console.error(err));
  }, []);

  const handleSavePayments = async () => {
    setLoading(true);
    const res = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paypalEmail, westernName, westernCountry }),
    });
    const result = await res.json();
    setLoading(false);
    if (result.success) {
      alert('✅ تم حفظ بيانات الحساب والمستلم بنجاح يا صديقي!');
    } else {
      alert('❌ فشل حفظ البيانات');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-6 text-right" dir="rtl">
      <h2 className="text-xl font-bold mb-4">⚙️ إعدادات طرق الدفع للموقع</h2>
      <div className="border-b pb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">حساب PayPal المستلم:</label>
        <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="example@paypal.com" className="w-full p-2 border rounded text-left" />
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-md text-blue-600">📌 بيانات التحويل عبر Western Union:</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستلم الكامل (كما في الهوية):</label>
          <input type="text" value={westernName} onChange={(e) => setWesternName(e.target.value)} placeholder="الاسم الرباعي الكامل" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الدولة والمدينة المتاح الاستلام فيها:</label>
          <input type="text" value={westernCountry} onChange={(e) => setWesternCountry(e.target.value)} placeholder="مثال: القاهرة، مصر" className="w-full p-2 border rounded" />
        </div>
      </div>
      <button onClick={handleSavePayments} disabled={loading} className="w-full bg-emerald-600 text-white p-3 rounded-lg font-bold hover:bg-emerald-700 transition disabled:bg-gray-400">
        {loading ? 'جاري الحفظ والربط...' : 'حفظ البيانات وتفعيلها فعلياً'}
      </button>
    </div>
  );
}
