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
      // تم استخدام signInWithOtp لضمان توليد وإرسال رمز 6 أرقام من خلال السيرفر
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true, // يضمن إنشاء حساب جديد تلقائياً في السيرفر للمستخدم الجديد
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

      // الانتقال الإجباري لخطوة الـ OTP في الواجهة
      setStep('otp');
    } catch (err) {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  // 2. التحقق من كود الـ OTP ومزامنته مع الأدمن الجدول الخارجي
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fullCode = code.join('');
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: fullCode,
        type: 'email', // تم تعديلها إلى email لتتوافق مع دالة إرسال الـ OTP الرقمي
      });

      if (verifyError) {
        setError('الرمز الإدخالي غير صحيح أو انتهت صلاحيته ❌');
        setLoading(false);
        return;
      }

      // مزامنة الاسم والبيانات تلقائياً في جدول الأدمن الخارجي ليظهر في القائمة فوراً
      if (data?.user) {
        localStorage.setItem('userId', data.user.id);
        await supabase
          .from('users')
          .insert([{ 
            id: data.user.id, 
            email: email.trim().toLowerCase(), 
            name: name.trim(), 
            role: 'user', 
            password: password // سيتم حفظ كلمة المرور في جدولك المخصص
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
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px' }}>
        
        {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>❌ {error}</div>}

        {step === 'register' ? (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold' }}>📝 إنشاء حساب جديد</h2>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>الاسم الكامل</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="أدخل اسمك الكريم" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="example@domain.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>كلمة المرور</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? '⏳ جاري إرسال رمز الأمان...' : '✉️ تسجيل الحساب وإرسال كود OTP'}
            </button>
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
