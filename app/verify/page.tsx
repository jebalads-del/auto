'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // جلب البريد الإلكتروني من URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('verificationEmail', emailParam);
    } else {
      const storedEmail = localStorage.getItem('verificationEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [searchParams]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.value !== '' && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      setError('يرجى إدخال الرمز المكون من 6 أرقام');
      setLoading(false);
      return;
    }

    try {
      // استخدام API للتحقق
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'الرمز المدخل غير صحيح');
        setLoading(false);
        return;
      }

      // حفظ userId في localStorage
      if (result.user) {
        localStorage.setItem('userId', result.user.id);
      }
      
      localStorage.removeItem('verificationEmail');
      alert('✅ تم تفعيل حسابك بنجاح!');
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '430px',
    margin: '100px auto',
    padding: '40px 30px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    textAlign: 'center' as const,
    direction: 'rtl' as const,
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '22px', marginBottom: '10px' }}>🔐 تحقق من حسابك</h2>
      <p style={{ color: '#666666', fontSize: '14px', marginBottom: '20px' }}>
        تم إرسال رمز التحقق إلى <br /><strong>{email || 'بريدك الإلكتروني'}</strong>
      </p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleVerifySubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', direction: 'ltr', marginBottom: '20px' }}>
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              inputMode="numeric"
              style={{ 
                width: '45px', 
                height: '50px', 
                fontSize: '20px', 
                textAlign: 'center', 
                borderRadius: '8px', 
                border: '1px solid #e0e0e0', 
                outline: 'none',
                backgroundColor: data ? '#f0f7ff' : '#ffffff',
                borderColor: data ? '#2563eb' : '#e0e0e0'
              }}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#93c5fd' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ جاري التحقق...' : '✅ تحقق من الرمز'}
        </button>
      </form>

      <div style={{ marginTop: '15px' }}>
        <button
          onClick={() => router.push('/login')}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          ← العودة إلى صفحة تسجيل الدخول
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>⏳ جاري تحميل الصفحة...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
