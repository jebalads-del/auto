'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 خانات
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('resetEmail', emailParam);
    } else {
      const storedEmail = localStorage.getItem('resetEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [searchParams]);

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.value !== '' && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      setError('يرجى إدخال رمز التحقق بالكامل (6 أرقام)');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      setLoading(false);
      return;
    }

    try {
      // 1. التحقق من OTP
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: fullOtp,
        type: 'email',
      });

      if (verifyError) {
        setError('رمز التحقق غير صحيح أو منتهي الصلاحية');
        setLoading(false);
        return;
      }

      if (!verifyData.user) {
        setError('فشل التحقق من الرمز');
        setLoading(false);
        return;
      }

      // 2. تحديث كلمة المرور
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess('✅ تم تغيير كلمة المرور بنجاح!');
      localStorage.removeItem('resetEmail');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', maxWidth: '430px', margin: '100px auto', padding: '30px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '10px', textAlign: 'center' }}>🔑 إعادة تعيين كلمة المرور</h2>
      <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
        {email ? `تم إرسال رمز التحقق إلى ${email}` : 'أدخل رمز التحقق وكلمة المرور الجديدة'}
      </p>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* OTP input - 6 خانات */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>🔢 رمز التحقق (6 أرقام من البريد الإلكتروني)</label>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', direction: 'ltr' }}>
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
                onChange={(e) => handleOtpChange(e.target, index)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>كلمة المرور الجديدة</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور الجديدة"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>تأكيد كلمة المرور</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أعد إدخال كلمة المرور"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#93c5fd' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ جاري التغيير...' : '🔑 تغيير كلمة المرور'}
        </button>
      </form>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button
          onClick={() => router.push('/login')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}
        >
          ← العودة إلى تسجيل الدخول
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px' }}>⏳ جاري التحميل...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
