'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    // جلب البريد الإلكتروني من URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // التحقق من وجود جلسة نشطة
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('انتهت صلاحية الجلسة، يرجى طلب رابط جديد');
      }
    };
    checkSession();
  }, [searchParams, supabase.auth]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
      // التحقق من الجلسة قبل التحديث
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('انتهت صلاحية الجلسة. يرجى طلب رابط جديد لإعادة تعيين كلمة المرور');
        setLoading(false);
        return;
      }

      // تحديث كلمة المرور
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess('✅ تم تغيير كلمة المرور بنجاح!');
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
    <div style={{ direction: 'rtl', maxWidth: '400px', margin: '100px auto', padding: '30px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '10px', textAlign: 'center' }}>🔑 إعادة تعيين كلمة المرور</h2>
      <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
        {email ? `تغيير كلمة المرور لـ ${email}` : 'أدخل كلمة المرور الجديدة'}
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

      <form onSubmit={handleResetPassword}>
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
