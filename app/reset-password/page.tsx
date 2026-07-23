'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'otp' | 'password'>('otp');

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      setError('الرجاء إدخال الكود المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: code }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ تم التحقق من الكود بنجاح!');
        setStep('password');
      } else {
        setError(data.error || 'الكود غير صحيح');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ تم إعادة تعيين كلمة المرور بنجاح!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور');
      }
    } catch {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {step === 'otp' ? '🔑 أدخل كود إعادة التعيين' : '🔑 كلمة مرور جديدة'}
        </h2>

        {error && <div style={styles.errorBox}>❌ {error}</div>}
        {success && <div style={styles.successBox}>✅ {success}</div>}

        {step === 'otp' ? (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>
              تم إرسال الكود إلى <strong>{email}</strong>
            </p>
            <div style={styles.otpContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      document.getElementById(`otp-${index-1}`)?.focus();
                    }
                  }}
                  style={styles.otpInput}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <button type="submit" disabled={loading || otp.some(d => !d)} style={styles.button}>
              {loading ? 'جاري التحقق...' : 'تحقق من الكود'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={styles.field}>
              <label style={styles.label}>كلمة المرور الجديدة</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>تأكيد كلمة المرور</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
            </button>
          </form>
        )}

        <Link href="/login" style={styles.link}>
          ← العودة إلى تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={styles.container}><div style={styles.card}><h2 style={styles.title}>جاري التحميل...</h2></div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '20px',
    fontFamily: 'sans-serif',
    direction: 'rtl' as const,
  },
  card: {
    maxWidth: '450px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '35px 30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  title: {
    textAlign: 'center' as const,
    fontSize: '24px',
    marginBottom: '25px',
    color: '#1e293b',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
  successBox: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
  otpContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '25px',
    direction: 'ltr' as const,
  },
  otpInput: {
    width: '48px',
    height: '58px',
    textAlign: 'center' as const,
    fontSize: '24px',
    fontWeight: 'bold',
    border: '2px solid #d1d5db',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: '#f9fafb',
    color: '#1e293b',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    marginBottom: '15px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#1e293b',
  },
  input: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    marginTop: '15px',
  },
};
