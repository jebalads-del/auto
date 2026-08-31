'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function NewPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف أو أرقام على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 جاري تحديث كلمة المرور في نظام الحماية الأساسي...');
      
      // 1. تحديث كلمة المرور في Supabase Auth الأساسي (باستخدام الجلسة المؤقتة للـ OTP)
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password: password
      });

      if (authError) {
        console.error('❌ خطأ Auth:', authError);
        setError('انتهت صلاحية الجلسة، يرجى إعادة طلب رمز OTP جديد');
        setLoading(false);
        return;
      }

      // 2. تحديث جدول المستخدمين الخارجي (لضمان المزامنة مع المساعد السابق)
      if (authData?.user?.email) {
        console.log('🔄 جاري تحديث الجدول المخصص للمستخدم:', authData.user.email);
        await supabase
          .from('users')
          .update({ password: password }) // حفظ النص أو التحديث حسب هيكلة جدولك
          .eq('email', authData.user.email);
      }

      setSuccess(true);
      console.log('✅ تم تغيير كلمة المرور بنجاح!');
      
      // الانتظار ثانيتين ثم التوجيه لصفحة تسجيل الدخول
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      console.error('❌ خطأ غير متوقع:', err);
      setError('حدث خطأ غير متوقع أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>🔒 كلمة مرور جديدة</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>أدخل كلمة المرور الجديدة لحسابك لتأمين الدخول</p>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            🎉 تم تغيير كلمة المرور بنجاح! جاري توجيهك لصفحة الدخول...
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>كلمة المرور الجديدة</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} 
              placeholder="••••••••" 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>تأكيد كلمة المرور</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || success} 
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '⏳ جاري الحفظ...' : 'تحديث كلمة السر بأمان'}
          </button>
        </form>
      </div>
    </div>
  );
}
