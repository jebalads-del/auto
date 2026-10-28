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

  // 2. تسجيل الدخول أو التسجيل باستخدام جوجل (Google OAuth)
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بجوجل');
    }
  };

  // 3. التحقق من كود الـ OTP ومزامنته مع الأدمن الجدول الخارجي
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
        await supabase
          .from('users')
          .insert([{ 
            id: data.user.id, 
            email: email.trim().toLowerCase(), 
            name: name.trim(), 
            role: 'user', 
            password: password 
          }]);
      }

      router.push('/profile');
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
            <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', margin: '0 0 10
