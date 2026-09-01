'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function RegisterPage() {
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

  // 1. دالة إرسال طلب تسجيل الحساب الأولية
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 جاري إنشاء الحساب للبريد:', email);
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // الانتقال لخطوة إدخال الرمز الرقمي
      setStep('otp');
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // 2. دالة التحقق من الرمز الرقمي وتفعيل الحساب (الإصلاح الحاسم)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('يرجى إدخال الرمز كاملاً المكون من 6 أرقام');
      setLoading(false);
      return;
    }

    try {
      console.log('📡 جاري تفعيل الحساب بالرمز الرقمي المكتوب...');
      
      // تغيير النوع هنا إلى 'signup' لضمان قبول الرمز وتوثيق الحساب
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: fullCode,
        type: 'signup', 
      });

      if (verifyError) {
        setError('الرمز غير صحيح أو انتهت صلاحيته ❌');
        setLoading(false);
        return;
      }

      console.log('✅ تم تفعيل الحساب وإدخال المستخدم بنجاح!');
      
      // التحديث والمزامنة لحفظ الجلسة في المتصفح والتوجيه للملف الشخصي
      if (data?.user) {
        localStorage.setItem('userId', data.user.id);
      }
      
      router.push('/profile');
      router.refresh();

    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء تفعيل الحساب');
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
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px' }}>
        
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
            ❌ {error}
          </div>
        )}

        {step === 'register' ? (
          /* واجهة تسجيل البيانات الأساسية */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>📝 إنشاء حساب جديد</h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>سجل بياناتك لتتمكن من نشر إعلاناتك وإدارتها</p>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} placeholder="example@domain.com" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>كلمة المرور</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ جاري إرسال الرمز...' : '✉️ تسجيل الحساب وإرسال الكود'}
            </button>
          </form>
        ) : (
          /* واجهة إدخال الرمز الرقمي OTP المطورة */
          <form onSubmit={handleVerifyOtp} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>🔐 تحقق من حسابك</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>تم إرسال رمز التفعيل المكون من 6 أرقام إلى بريدك بنجاح</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', direction: 'ltr', marginBottom: '30px' }}>
              {code.map((num, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={num}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  required
                  style={{ width: '42px', height: '48px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', outline: 'none', backgroundColor: '#f8fafc' }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ جاري التحقق والتفعيل...' : 'تحقق من الرمز وتفعيل الحساب ✅'}
            </button>
          </form>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', fontSize: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
          <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>لديك حساب بالفعل؟ سجل دخولك</Link>
        </div>
      </div>
    </div>
  );
}
