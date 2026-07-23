'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);

  // التحقق من صحة الرابط
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('رابط إعادة التعيين غير صالح');
        setChecking(false);
        return;
      }

      try {
        const response = await fetch(`/api/reset-password/verify?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setValidToken(true);
        } else {
          setError('هذا الرابط غير صالح أو انتهت صلاحيته');
        }
      } catch {
        setError('حدث خطأ أثناء التحقق من الرابط');
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ تم إعادة تعيين كلمة المرور بنجاح!');
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

  if (checking) {
    return (
      <div style={styles.container}>
        <h2>جاري التحقق من الرابط...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔑 إعادة تعيين كلمة المرور</h2>

        {error && (
          <div style={styles.errorBox}>
            ❌ {error}
          </div>
        )}

        {message && (
          <div style={styles.successBox}>
            ✅ {message}
          </div>
        )}

        {!validToken ? (
          <div style={styles.invalidBox}>
            <p>⚠️ هذا الرابط غير صالح أو انتهت صلاحيته.</p>
            <Link href="/forgot-password" style={styles.link}>
              طلب رابط جديد
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>كلمة المرور الجديدة</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'جاري إعادة التعيين...' : 'إعادة تعيين كلمة المرور'}
            </button>

            <Link href="/login" style={styles.link}>
              ← العودة إلى تسجيل الدخول
            </Link>
          </form>
        )}
      </div>
    </div>
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
  invalidBox: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
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
