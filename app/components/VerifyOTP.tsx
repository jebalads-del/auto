// @ts-nocheck
'use client';

import { useState } from 'react';

interface VerifyOTPProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function VerifyOTP({ email, onSuccess, onBack }: VerifyOTPProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'فشل إرسال رمز التحقق');
      } else {
        alert('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'رمز التحقق غير صحيح');
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 تحقق من هويتك</h2>
      <p style={styles.subtitle}>تم إرسال رمز التحقق إلى <strong>{email}</strong></p>
      
      <form onSubmit={handleVerifyOTP} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>رمز التحقق</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="أدخل الرمز المكون من 6 أرقام"
            style={styles.input}
            required
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
        </button>

        <button type="button" onClick={handleSendOTP} disabled={loading} style={styles.resendButton}>
          إعادة إرسال الرمز
        </button>

        <button type="button" onClick={onBack} style={styles.backButton}>
          ← العودة لتسجيل الدخول
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    direction: 'rtl' as const
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center' as const,
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    textAlign: 'center' as const,
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px'
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#475569'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    textAlign: 'center' as const,
    backgroundColor: '#fef2f2',
    padding: '8px',
    borderRadius: '6px'
  },
  button: {
    padding: '12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  resendButton: {
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  backButton: {
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer'
  }
};
