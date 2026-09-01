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
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  // 1. دالة تسجيل الحساب وإرسال كود الـ OTP لحماية الموقع من العشوائية
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (name.trim().length < 3) {
      setError('يرجى إدخال اسم كامل صحيح لا يقل عن 3 أحرف');
      return;
    }

    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();

    try {
      console.log('🔄 جاري إرسال طلب إنشاء الحساب والـ OTP للبريد:', trimmedEmail);
      
      // حفظ بيانات المستخدم مؤقتاً في ذاكرة المتصفح لإدراجها بعد تفعيل الرمز
      localStorage.setItem('temp_reg_name', name.trim());
      localStorage.setItem('temp_reg_pass', password);

      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
      });

      if (signUpError) {
        console.error('❌ خطأ إنشاء حساب سوبابيس:', signUpError);
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      console.log('✅ تم إرسال الرمز بنجاح، الانتقال لواجهة الـ OTP الرقمي');
      setStep('otp');

    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  // 2. دالة التحقق من كود الـ OTP وتفعيل المستخدم ومزامنته مع لوحة الأدمن
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('يرجى إدخال الرمز المكون من 6 أرقام كاملاً');
      return;
    }

    setLoading(true);
    const trimmedEmail = email.trim().toLowerCase();
    const savedName = localStorage.getItem('temp_reg_name') || 'مستخدم جديد';
    const savedPass = localStorage.getItem('temp_reg_pass') || '12345678';

    try {
      console.log('📡 جاري التحقق من رمز الـ OTP للعملية signup...');
      
      // تأكيد تفعيل الحساب برمز الـ OTP بنوع العمليات الصحيح 'signup'
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: fullCode,
        type: 'signup',
      });

      if (verifyError) {
        console.error('❌ خطأ الرمز:', verifyError);
        setError('رمز التحقق غير صحيح أو انتهت صلاحيته ❌');
        setLoading(false);
        return;
      }

      console.log('✅ تم تفعيل الحساب بنجاح! جاري المزامنة التلقائية مع الأدمن...');

      // إدراج الحساب المفعّل بنجاح داخل جدول المستخدمين الخارجي ليظهر فوراً عند الأدمن
      if (data?.user) {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userRole', 'user');

        await supabase
          .from('users')
          .insert([
            { id: data.user.id, email: trimmedEmail, name: savedName, role: 'user', password: savedPass }
          ]);
      }

      // تنظيف الذاكرة المؤقتة والتوجيه المباشر للملف الشخصي
      localStorage.removeItem('temp_reg_name');
      localStorage.removeItem('temp_reg_pass');
      setSuccess(true);

      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 1500);

    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء تفعيل وتأكيد حسابك');
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
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
            🎉 تم تفعيل حسابك بنجاح! جاري توجيهك لملفك الشخصي...
          </div>
        )}

        {step === 'register' ? (
          /* النموذج البرمجي الثلاثي لعرض الخانات والاسم بالكامل */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '5px' }}>📝 إنشاء حساب جديد</h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>سجل بياناتك لتصلك رسالة الـ OTP لتفعيل حسابك بأمان وموثوقية</p>
            
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

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(37,99,235,0.15)' }}>
              {loading ? '⏳ جاري إرسال رمز التفعيل...' : '✉️ تسجيل الحساب وإرسال كود OTP'}
            </button>
          </form>
        ) : (
          /* واجهة إدخال الرمز من 6 خانات أنيقة بنفس الصفحة منعا لمشاكل الجلسة */
          <form onSubmit={handleVerifyOtp} style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>🔐 رمز تفعيل الحساب</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>مرحباً بك يا <b>{name}</b>، يرجى كتابة رمز الـ OTP المكون من 6 أرقام المرسل لبريدك الإلكتروني تلافياً للحسابات العشوائية:</p>

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
                  style={{ width: '42px', height: '46px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', outline: 'none', backgroundColor: '#f8fafc' }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading || success} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? '⏳ جاري تأكيد الرمز تفعيل الحساب...' : 'تحقق من الرمز وتأكيد التسجيل وبدء التصفح ✅'}
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
