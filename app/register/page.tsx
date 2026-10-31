'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  // 1. إرسال طلب إنشاء الحساب وإرسال رمز الـ OTP الرقمي (6 خانات)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true, 
          data: { 
            full_name: name.trim()
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setStep('otp');
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  // 2. تسجيل الدخول أو التسجيل باستخدام جوجل (Google OAuth) - توجيه حصري لـ /select-role
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/select-role`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بجوجل');
    }
  };

  // 3. التحقق من كود الـ OTP وتوجيه المستخدم حصرياً لصفحة اختيار نوع الحساب
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fullCode = code.join('');
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: fullCode,
        type: 'email', 
      });

      if (verifyError) {
        setError('الرمز الإدخالي غير صحيح أو انتهت صلاحيته ❌');
        setLoading(false);
        return;
      }

      if (data?.user) {
        localStorage.setItem('userId', data.user.id);
        
        // 🛠️ تهيئة البروفايل في جدول profiles (وليس users) ليتمكن من اختيار نوع الحساب لاحقاً
        await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id, 
            email: email.trim().toLowerCase(), 
            role: 'user',
            account_type: null // تركها فارغة إجباراً لتظهر له صفحة اختيار الدور
          }, { onConflict: 'id' });
      }

      // 🚀 التوجيه لصفحة اختيار الدور حصرياً لكل مستخدم جديد
      router.push('/select-role');
      router.refresh();
    } catch (err) {
      setError('حدث خطأ أثناء التفعيل');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value !== '' && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px', position: 'relative' }}>
        
        {/* زر العودة للرئيسية في أعلى البطاقة */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
            🏠 الرئيسية
          </Link>
        </div>

        {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>❌ {error}</div>}

        {step === 'register' ? (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', margin: '0 0 10px 0' }}>📝 إنشاء حساب جديد</h2>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>الاسم الكامل</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="أدخل اسمك الكريم" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="example@domain.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>كلمة المرور</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} placeholder="••••••••" />
            </div>
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? '⏳ جاري إرسال رمز الأمان...' : '✉️ تسجيل الحساب وإرسال كود OTP'}
            </button>

            {/* فاصل أنيق */}
            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: '5px 0' }}>
              <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }}></div>
              <span style={{ padding: '0 10px' }}>أو التسجيل عبر</span>
              <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }}></div>
            </div>

            {/* زر تسجيل الدخول عبر جوجل في الأسفل */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.15v3.14C3.11 21.36 7.22 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.62H1.15C.42 8.08 0 9.72 0 12s.42 3.92 1.15 5.38l4.12-3.14z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.11 2.64 1.15 6.62l4.12 3.14c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
              التسجيل باستخدام جوجل
            </button>

            <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '14px', color: '#64748b' }}>
              هل لديك حساب بالفعل؟{' '}
              <Link href="/login" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
                سجل الدخول
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>🔐 رمز تفعيل الحساب</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>يرجى كتابة رمز الـ OTP المكون من 6 أرقام المرسل لبريدك الإلكتروني لتأكيد التسجيل:</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', direction: 'ltr', marginBottom: '30px' }}>
              {code.map((num, idx) => (
                <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={num} onChange={(e) => handleOtpChange(e.target.value, idx)} required style={{ width: '42px', height: '46px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }} />
              ))}
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? '⏳ جاري تفعيل الحساب...' : 'تحقق من الرمز وتأكيد الحساب ✅'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
