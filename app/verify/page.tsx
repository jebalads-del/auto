'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || '';
  const password = searchParams.get('p') || '';
  const name = searchParams.get('n') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== '') {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fullOtp = otp.join('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullOtp }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'الرمز المدخل غير صحيح، حاول مجدداً');
        setLoading(false);
        return;
      }

      // 1. إنشاء وتوثيق الحساب أمنياً في نظام Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // 2. ترحيل ونسخ المستخدم تلقائياً إلى جدول قاعدة البيانات العام لظهوره في لوحة الأدمن والـ Login
      // تنبيه: تأكد مما إذا كان اسم الجدول في لوحة تحكمك هو 'users' أو 'profiles' وقم بتبديله إذا لزم الأمر
      if (data?.user) {
        const { error: insertError } = await supabase
          .from('users') 
          .insert([
            {
              id: data.user.id,
              email: email,
              name: name,
              role: 'user' // الصلاحية الافتراضية للمستخدم الجديد
            }
          ]);

        if (insertError) {
          console.error("خطأ أثناء ترحيل بيانات المستخدم للوحة التحكم:", insertError.message);
          // نكتفي بطباعة الخطأ في الـ Console لكي لا يتعطل توجيه المستخدم إذا تم التفعيل أمنياً
        }
      }

      alert('تم تفعيل حسابك بنجاح ومرحباً بك!');
      router.push('/dashboard');

    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالسيرفر');
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
      <h2 style={{ fontSize: '22px', marginBottom: '10px' }}>تحقق من حسابك</h2>
      <p style={{ color: '#666666', fontSize: '14px', marginBottom: '20px' }}>
        تم إرسال رمز التحقق إلى <br /><strong>{email}</strong>
      </p>

      {error && <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}

      <form onSubmit={handleVerifySubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', direction: 'ltr', marginBottom: '30px' }}>
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              style={{ width: '45px', height: '50px', fontSize: '20px', textAlign: 'center', borderRadius: '8px', border: '1px solid #e0e0e0', outline: 'none' }}
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
            padding: '16px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
        </button>
      </form>
    </div>
  );
}

// المكون المصدر المحمي بغلاف الـ Suspense لمنع أخطاء بناء السيرفر في Next.js
export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>جاري تحميل الصفحة...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
