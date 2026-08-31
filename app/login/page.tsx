'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 محاولة تسجيل الدخول:', email);

      // 1. تسجيل الدخول عبر Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('❌ خطأ في تسجيل الدخول:', error);
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('حدث خطأ غير متوقع');
        setLoading(false);
        return;
      }

      console.log('✅ تم تسجيل الدخول بنجاح:', data.user.email);

      // حفظ userId
      localStorage.setItem('userId', data.user.id);

      // التحقق من دور المستخدم
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', data.user.email)
        .single();

      if (userError) {
        console.error('❌ خطأ في جلب دور المستخدم:', userError);
        // توجيه افتراضي
        router.push('/');
        setLoading(false);
        return;
      }

      console.log('👤 دور المستخدم:', userData?.role);

      // توجيه حسب الدور
      if (userData?.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/');
      }

    } catch (err: any) {
      console.error('❌ خطأ غير متوقع:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>مرحباً بك مجدداً</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>سجل دخولك لإدارة حسابك وإعلاناتك</p>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} 
              placeholder="example@domain.com" 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>كلمة المرور</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} 
              placeholder="••••••••" 
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
              opacity: loading ? 0.7 : 1, 
              transition: '0.2s' 
            }}
          >
            {loading ? '⏳ جاري تسجيل الدخول...' : '🚪 دخول'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', fontSize: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', gap: '15px' }}>
          <Link href="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>تسجيل حساب جديد</Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <Link href="/forgot-password" style={{ color: '#64748b', textDecoration: 'none' }}>نسيت كلمة السر؟</Link>
        </div>
      </div>
    </div>
  );
}
