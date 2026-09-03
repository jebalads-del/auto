'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. جلب المستخدم الحالي
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !currentUser) {
          console.error('❌ خطأ في جلب المستخدم:', userError);
          setLoading(false);
          return;
        }

        console.log('✅ المستخدم:', currentUser);

        // 2. جلب بيانات المستخدم من جدول users
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (dbError) {
          console.error('❌ خطأ في جلب بيانات المستخدم:', dbError);
        }

        console.log('📦 بيانات المستخدم من قاعدة البيانات:', userData);

        // 3. تعيين البيانات
        const userName = userData?.name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'مستخدم';
        const userPhone = userData?.phone || '';
        const userEmail = userData?.email || currentUser.email || '';

        setUser(currentUser);
        setName(userName);
        setPhone(userPhone);
        setEmail(userEmail);

        console.log('✅ تم تعيين البيانات:', { name: userName, phone: userPhone, email: userEmail });

      } catch (err) {
        console.error('❌ خطأ غير متوقع:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // حفظ التغييرات
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      if (!user) {
        setMessage({ text: '❌ لم يتم العثور على المستخدم', type: 'error' });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        setMessage({ text: `❌ ${error.message}`, type: 'error' });
        setSaving(false);
        return;
      }

      setMessage({ text: '✅ تم تحديث بياناتك الشخصية بنجاح!', type: 'success' });

      // تحديث localStorage
      localStorage.setItem('userName', name.trim());

    } catch (err: any) {
      setMessage({ text: `❌ ${err.message || 'حدث خطأ'}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '15px', color: '#64748b' }}>⏳ جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', margin: 0 }}>👤 الملف الشخصي</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          🚪 خروج
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '12px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>البريد الإلكتروني (لا يمكن تعديله)</label>
          <input
            type="email"
            value={email}
            disabled
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>الاسم الكامل</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px'
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>رقم الهاتف</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="أدخل رقم هاتفك"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: saving ? '#93c5fd' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
        </button>
      </form>

      <Link href="/" style={{ display: 'block', textAlign: 'center', marginTop: '15px', color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
        ← العودة للرئيسية
      </Link>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
