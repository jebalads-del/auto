'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.value !== '' && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. إنشاء المستخدم في Supabase Auth (بدون إرسال بريد)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { 
            name: name.trim(),
            phone: phone.trim(),
          },
          emailRedirectTo: `${window.location.origin}/register`,
        },
      });

      if (error) {
        console.error('❌ SignUp error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // 2. إنشاء OTP عشوائي
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // حفظ OTP مؤقتاً
        localStorage.setItem('tempOtp', otpCode);
        localStorage.setItem('tempEmail', email.trim());
        localStorage.setItem('tempName', name.trim());
        localStorage.setItem('tempPhone', phone.trim());
        localStorage.setItem('tempPassword', password);
        
        // 3. إرسال البريد عبر Resend
        const resendResponse = await fetch('/api/resend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            token: otpCode,
            name: name.trim(),
          }),
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
          console.error('❌ Resend error:', resendData);
          setError(resendData.message || 'حدث خطأ في إرسال البريد الإلكتروني');
          setLoading(false);
          return;
        }

        setUserId(data.user.id);
        setStep('verify');
        setSuccess('✅ تم إرسال رمز التحقق إلى بريدك الإلكتروني');
        console.log('✅ OTP sent:', otpCode);
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const fullOtp = otp.join('');
    const storedOtp = localStorage.getItem('tempOtp');
    const storedEmail = localStorage.getItem('tempEmail') || email;
    const storedName = localStorage.getItem('tempName') || name;
    const storedPhone = localStorage.getItem('tempPhone') || phone;
    const storedPassword = localStorage.getItem('tempPassword') || password;

    if (fullOtp.length < 6) {
      setError('يرجى إدخال رمز التحقق بالكامل (6 أرقام)');
      setLoading(false);
      return;
    }

    // التحقق من OTP محلياً
    if (fullOtp !== storedOtp) {
      setError('رمز التحقق غير صحيح');
      setLoading(false);
      return;
    }

    try {
      // تأكيد المستخدم في Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: storedEmail,
        token: fullOtp,
        type: 'email',
      });

      if (error) {
        console.error('❌ Verify error:', error);
        setError(error.message || 'رمز التحقق غير صحيح');
        setLoading(false);
        return;
      }

      if (data.user) {
        // إضافة المستخدم إلى جدول users
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: storedEmail,
              name: storedName,
              phone: storedPhone,
              role: 'user',
              status: 'active',
            },
          ]);

        if (insertError) {
          console.error('❌ خطأ في إضافة المستخدم:', insertError);
        }

        // تنظيف localStorage
        localStorage.removeItem('tempOtp');
        localStorage.removeItem('tempEmail');
        localStorage.removeItem('tempName');
        localStorage.removeItem('tempPhone');
        localStorage.removeItem('tempPassword');

        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', storedName);
        localStorage.setItem('userEmail', storedEmail);

        setSuccess('✅ تم تفعيل حسابك بنجاح!');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // إعادة إرسال الرمز
  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const storedEmail = localStorage.getItem('tempEmail') || email;
    const storedName = localStorage.getItem('tempName') || name;

    try {
      // إنشاء OTP جديد
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('tempOtp', otpCode);

      // إرسال البريد عبر Resend
      const resendResponse = await fetch('/api/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: storedEmail,
          token: otpCode,
          name: storedName,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        setError(errorData.message || 'حدث خطأ في إعادة الإرسال');
        setLoading(false);
        return;
      }

      setSuccess('✅ تم إعادة إرسال الرمز إلى بريدك الإلكتروني');
      console.log('✅ OTP resent:', otpCode);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // صفحة إدخال OTP
  if (step === 'verify') {
    return (
      <div style={{ direction: 'rtl', maxWidth: '400px', margin: '50px auto', padding: '30px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '10px', textAlign: 'center' }}>🔐 تحقق من حسابك</h2>
        <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
          تم إرسال رمز التحقق إلى <br /><strong>{email || localStorage.getItem('tempEmail')}</strong>
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

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>🔢 رمز التحقق (6 أرقام)</label>
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
            {loading ? '⏳ جاري التحقق...' : '✅ تحقق من الرمز'}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button
            onClick={handleResend}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline',
            }}
          >
            🔄 إعادة إرسال الرمز
          </button>
        </div>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
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
            ← العودة إلى تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // صفحة التسجيل
  return (
    <div style={{ direction: 'rtl', maxWidth: '400px', margin: '50px auto', padding: '30px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '10px', textAlign: 'center' }}>📝 إنشاء حساب جديد</h2>
      <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
        أدخل بياناتك لإنشاء حساب جديد
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

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>الاسم الكامل</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسمك الكامل"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="أدخل بريدك الإلكتروني"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>رقم الهاتف</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="أدخل رقم هاتفك (اختياري)"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
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
          {loading ? '⏳ جاري إنشاء الحساب...' : '🚀 إنشاء حساب'}
        </button>
      </form>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>
          لديك حساب؟ تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
