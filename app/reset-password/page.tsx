'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ResetPasswordPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('mara7b@gmail.com'); // يتم جلب الإيميل أو تركه مرناً
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // المزامنة الذكية لمتغيرات البيئة لحل مشكلة فشل الاتصال بالخادم
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // الانتقال التلقائي للخانة التالية
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
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
      console.log('🔄 جاري التحقق من الرمز الـ OTP الخاص بـ Reset Password...');
      
      // التحقق من رمز إعادة التعيين عبر Supabase
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: fullCode,
        type: 'recovery', // النوع مخصص لاستعادة كلمة المرور
      });

      if (verifyError) {
        console.error('❌ خطأ التحقق من الرمز:', verifyError);
        setError('الرمز غير صحيح أو انتهت صلاحيته');
        setLoading(false);
        return;
      }

      console.log('✅ تم التحقق من الرمز بنجاح!');
      setSuccess(true);
      
      // التوجيه الفوري لصفحة تحديث كلمة المرور (تأكد من وجود المسار لديك أو توجيهه للملف الشخصي)
      router.push('/profile'); 
      router.refresh();

    } catch (err: any) {
      console.error('❌ خطأ غير متوقع:', err);
      setError('حدث خطأ غير متوقع، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '460px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>🔑 أدخل كود إعادة التعيين</h2>
        
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
            🎉 تم التحقق بنجاح! جاري التوجيه...
          </div>
        )}

        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>تم إرسال الكود المكون من 6 خانات إلى حساب المستخدم</p>

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', direction: 'ltr', marginBottom: '30px' }}>
            {code.map((num, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={num}
                onChange={(e) => handleChange(e.target.value, idx)}
                required
                style={{ width: '45px', height: '50px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', outline: 'none', backgroundColor: '#f8fafc' }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '⏳ جاري التحقق...' : 'تحقق من الكود'}
          </button>
        </form>
      </div>
    </div>
  );
}
