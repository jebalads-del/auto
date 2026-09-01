'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  const handleRegisterAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      console.log('🔄 إنشاء حساب جديد وتفعيله آلياً ومباشرة للبريد:', trimmedEmail);
      
      // 1. إنشاء الحساب في نظام الحماية الأساسي
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      console.log('✅ تم إنشاء الحساب بنجاح، جاري المزامنة مع جدول الأدمن الخارجي...');

      // 2. المزامنة المباشرة والفورية مع جدول الأدمن الخارجي لحفظ الاسم والرتبة تلقائياً
      if (data?.user) {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userRole', 'user');

        await supabase
          .from('users')
          .insert([
            { id: data.user.id, email: trimmedEmail, name: name.trim(), role: 'user', password: password }
          ]);
      }

      setSuccess(true);
      console.log('🎉 اكتمل التسجيل والمزامنة بنجاح تام!');

      // التوجيه التلقائي والفوري لصفحة الملف الشخصي لتبدأ المتعة بدون تعليق الـ OTP
      router.push('/profile');
      router.refresh();

    } catch (err) {
      console.error('❌ خطأ غير متوقع:', err);
      setError('حدث خطأ أثناء إعداد حسابك، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px' }}>
        
        <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>📝 إنشاء حساب جديد</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '25px' }}>سجل بياناتك لتتمكن من نشر إعلاناتك وإدارتها فوراً</p>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
            🎉 تم إنشاء حسابك وتفعيله بنجاح! جاري فتح ملفك الشخصي...
          </div>
        )}

        <form onSubmit={handleRegisterAndLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>الاسم الكامل</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} placeholder="أدخل اسمك الكريم" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} placeholder="example@domain.com" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading || success} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37,99,235,0.15)' }}>
            {loading ? '⏳ جاري تهيئة وتأمين الحساب...' : '🚀 تسجيل الحساب والدخول الفوري'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', fontSize: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>لديك حساب بالفعل؟ سجل دخولك</Link>
        </div>
      </div>
    </div>
  );
}
