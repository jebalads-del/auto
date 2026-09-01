'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<'otp' | 'new_password'>('otp');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  // 1. طلب إرسال الرمز الرقمي
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('يرجى كتابة البريد الإلكتروني أولاً');
      return;
    }
    setError('');
    setLoading(true);

    try {
      console.log('🔄 جاري طلب رمز استعادة للبريد:', email.trim());
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }
      alert('🎉 تم إرسال الرمز الرقمي المكون من 6 خانات بنجاح إلى بريدك الإلكتروني');
    } catch (err) {
      setError('حدث خطأ أثناء طلب الرمز');
    } finally {
      setLoading(false);
    }
  };

  // 2. التحقق من الرمز مع تثبيت الإيميل الصحيح لحل خطأ الرمز
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('يرجى التأكد من كتابة البريد الإلكتروني');
      return;
    }

    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('يرجى إدخال الرمز المكون من 6 أرقام كاملاً');
      return;
    }

    setLoading(true);

    try {
      const currentEmail = email.trim().toLowerCase();
      console.log('📡 جاري التحقق من الرمز للبريد المكتوب:', currentEmail);

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: currentEmail,
        token: fullCode,
        type: 'recovery',
      });

      if (verifyError) {
        console.error('❌ خطأ التحقق:', verifyError);
        setError('الرمز غير صحيح أو انتهت صلاحيته ❌');
        setLoading(false);
        return;
      }

      console.log('✅ تم التحقق من الرمز بنجاح! الانتقال لواجهة كلمة المرور الجديدة');
      setStep('new_password');
    } catch (err) {
      setError('حدث خطأ أثناء التحقق من الرمز');
    } finally {
      setLoading(false);
    }
  };

  // 3. تحديث كلمة المرور في الـ Auth والجدول معاً
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 خانات على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين ❌');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) {
        setError('انتهت صلاحية الجلسة الأمنية، يرجى إعادة طلب الرمز');
        setLoading(false);
        return;
      }

      if (authData?.user?.email) {
        await supabase
          .from('users')
          .update({ password: newPassword })
          .eq('email', authData.user.email);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء الحفظ');
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

        {success && (
          <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
            🎉 تم تغيير كلمة المرور بنجاح! جاري توجيهك لصفحة الدخول...
          </div>
        )}

        {step === 'otp' ? (
          <div>
            <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>🔑 استعادة كلمة السر</h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '25px' }}>أدخل بريدك الإلكتروني لاستلام رمز الـ OTP المكون من 6 خانات</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#334155', marginBottom: '6px' }}>البريد الإلكتروني المعتمد</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ flexGrow: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="example@domain.com" />
                <button type="button" onClick={handleRequestOtp} disabled={loading} style={{ padding: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>أرسل الرمز</button>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>أدخل رمز الـ OTP المستلم المكون من 6 خانات بالأسفل:</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', direction: 'ltr', marginBottom: '25px' }}>
                {code.map((num, idx) => (
                  <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={num} onChange={(e) => handleOtpChange(e.target.value, idx)} required style={{ width: '42px', height: '46px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', outline: 'none' }} />
                ))}
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                {loading ? '⏳ جاري التحقق...' : 'التحقق من الرمز المستلم'}
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>🔒 تعيين كلمة سر جديدة</h2>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>أدخل كلمة المرور الجديدة لحسابك: <b>{email}</b></p>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>كلمة المرور الجديدة</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="••••••••" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>تأكيد كلمة المرور</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading || success} style={{ width: '100%', padding: '14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
              {loading ? '⏳ جاري الحفظ والتأمين...' : 'تحديث كلمة السر بأمان ✅'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
