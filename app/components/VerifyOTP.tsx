'use client';
import { useState } from 'react';

export default function VerifyOTP() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ تم إرسال الكود إلى بريدك');
        setStep('otp');
      } else {
        setError('❌ ' + data.error);
      }
    } catch (err) {
      setError('❌ خطأ في الاتصال');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ تم التحقق بنجاح!');
        setTimeout(() => {
          setEmail('');
          setOtp('');
          setStep('email');
          setMessage('');
        }, 2000);
      } else {
        setError('❌ ' + data.error);
      }
    } catch (err) {
      setError('❌ خطأ في الاتصال');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'right', direction: 'rtl' }}>
      <h1>التحقق من البريد</h1>
      {error && <div style={{ color: 'red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>{error}</div>}
      {message && <div style={{ color: 'green', padding: '10px', marginBottom: '10px', backgroundColor: '#e6ffe6', borderRadius: '5px' }}>{message}</div>}
      
      {step === 'email' ? (
        <form onSubmit={handleSendOTP}>
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {loading ? 'جاري...' : 'إرسال الكود'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <p style={{ textAlign: 'center', color: '#666' }}>الكود أُرسل إلى: <strong>{email}</strong></p>
          <input type="text" placeholder="أدخل الكود (6 أرقام)" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '18px', textAlign: 'center', boxSizing: 'border-box' }} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {loading ? 'جاري...' : 'تحقق من الكود'}
          </button>
        </form>
      )}
    </div>
  );
}
