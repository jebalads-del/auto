'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// مكون منفصل يستخدم useSearchParams
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      setError('الرجاء إدخال الرمز المكون من 6 أرقام');
      return;
    }

    if (!email) {
      setError('لم يتم العثور على البريد الإلكتروني');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: code }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ تم التحقق من حسابك بنجاح!');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(data.error || 'رمز التحقق غير صحيح');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      setError('فشل الاتصال بالخادم، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ تم إعادة إرسال رمز التحقق');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      } else {
        setError(data.error || 'فشل إعادة إرسال الرمز');
      }
    } catch (error) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px',
      fontFamily: 'sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '35px 30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#dbeafe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px'
          }}>
            <span style={{ fontSize: '28px' }}>📧</span>
          </div>
          <h2 style={{ fontSize: '22px', color: '#1e293b', margin: 0 }}>تحقق من حسابك</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
            تم إرسال رمز التحقق إلى <br />
            <strong style={{ color: '#2563eb' }}>{email}</strong>
          </p>
        </div>

        {/* رسائل الخطأ والنجاح */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            padding: '12px',
            borderRadius: '10px',
            color: '#b91c1c',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            padding: '12px',
            borderRadius: '10px',
            color: '#15803d',
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            ✅ {success}
          </div>
        )}

        {/* OTP Input */}
        <form onSubmit={handleVerify}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '25px',
            direction: 'ltr'
          }}>
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
                style={{
                  width: '48px',
                  height: '58px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#f9fafb',
                  color: '#1e293b'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some((digit) => !digit)}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading || otp.some((digit) => !digit) ? '#93c5fd' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading || otp.some((digit) => !digit) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
          </button>
        </form>

        {/* خيارات إضافية */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          fontSize: '14px'
        }}>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              إعادة إرسال الرمز
            </button>
          ) : (
            <span style={{ color: '#94a3b8' }}>
              إعادة الإرسال خلال {timer} ثانية
            </span>
          )}
          
          <Link
            href="/register"
            style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← العودة
          </Link>
        </div>

        {/* تذكير */}
        <div style={{
          marginTop: '25px',
          padding: '15px',
          backgroundColor: '#f1f5f9',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#64748b',
          textAlign: 'center'
        }}>
          💡 تأكد من فحص صندوق الوارد والبريد المزعج (Spam)
        </div>
      </div>
    </div>
  );
}

// المكون الرئيسي مع Suspense
export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
