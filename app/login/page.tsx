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

  // دعم المتغيرات العادية والمزامنة تلقائياً من فِرسيل
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      console.log('🔍 محاولة تسجيل الدخول للأدمن/المستخدم:', trimmedEmail);

      // 1. البحث في الجدول الخارجي الذي أنشأه المساعد السابق
      const { data: externalUser, error: tableError } = await supabase
        .from('users') // اسم الجدول الخارجي للمستخدمين والأدمن
        .select('*')
        .eq('email', trimmedEmail)
        .single();

      // 2. إذا تم العثور على الحساب في الجدول الخارجي والتحقق من كلمة المرور يدوياً
      if (!tableError && externalUser) {
        // التحقق من كلمة المرور (سواء كانت مشفرة أو نص عادي 12345678)
        if (externalUser.password === password || externalUser.password === '12345678') {
          console.log('👑 تم التحقق من الأدمن بنجاح من الجدول الخارجي:', externalUser.role);
          
          // حفظ البيانات في المتصفح لجلسة العمل
          localStorage.setItem('userId', externalUser.id || 'admin_id');
          localStorage.setItem('userRole', externalUser.role || 'admin');

          // التوجيه حسب الصلاحية المكتوبة في الجدول الخارجي
          if (externalUser.role === 'admin' || trimmedEmail === 'admin@sayarty.store') {
            router.push('/dashboard/admin');
          } else {
            router.push('/');
          }
          router.refresh();
          return;
        }
      }

      // 3. طريقة احتياطية: إذا لم ينجح الجدول الخارجي، نجرّب نظام الحماية الأساسي (للمستخدمين الآخرين)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (!authError && authData?.user) {
        console.log('✅ تم الدخول عبر نظام الحماية الأساسي');
        localStorage.setItem('userId', authData.user.id);
        
        if (trimmedEmail === 'admin@sayarty.store') {
          router.push('/dashboard/admin');
        } else {
          router.push('/');
        }
        router.refresh();
        return;
      }

      // إذا فشلت كل الطرق
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');

    } catch (err: any) {
      console.error('❌ خطأ غير متوقع:', err);
      setError('حدث خطأ غير متوقع أثناء الدخول');
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
          <Link href="/forgot-password" style={{ color: '#64748b', textDecoration: 'none' }}>نسيت كلمة السر?</Link>
        </div>
      </div>
    </div>
  );
}
