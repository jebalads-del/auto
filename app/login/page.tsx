'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('الرجاء ملء جميع الحقول');
        setLoading(false);
        return;
      }

      console.log('محاولة تسجيل دخول:', { email });

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // حفظ جلسة المستخدم
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', data.user.id?.toString() || '1');
        
        // الحصول على مسار إعادة التوجيه
        const searchParams = new URLSearchParams(window.location.search);
        const redirectPath = searchParams.get('redirect') || '/dashboard';
        
        router.push(redirectPath);
      } else {
        setError(data.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة!');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        padding: '30px', 
        border: '1px solid #ddd', 
        borderRadius: '12px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
        backgroundColor: '#fff' 
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '24px' }}>🔐 تسجيل الدخول</h1>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontSize: '14px' }}>
          مرحباً بك في لوحة التحكم
        </p>

        {error && (
          <div style={{ backgroundColor: '#fee', padding: '12px', borderRadius: '8px', color: '#c33', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ccc', 
                borderRadius: '8px', 
                boxSizing: 'border-box',
                fontSize: '16px'
              }}
              placeholder="example@email.com"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #ccc', 
                borderRadius: '8px', 
                boxSizing: 'border-box',
                fontSize: '16px'
              }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
            disabled={loading}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            {loading ? 'جاري التحقق...' : '🚪 دخول'}
          </button>
        </form>

        {/* ✅ الأزرار الجديدة */}
        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <Link 
              href="/register" 
              style={{ 
                color: '#2563eb', 
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'inline-block'
              }}
            >
              ✨ إنشاء حساب جديد
            </Link>
          </div>
          <div>
            <Link 
              href="/forgot-password" 
              style={{ 
                color: '#64748b', 
                textDecoration: 'none',
                fontSize: '13px',
                display: 'inline-block'
              }}
            >
              🔑 نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        {/* إضافة مسار للرجوع للرئيسية */}
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <Link 
            href="/" 
            style={{ 
              color: '#94a3b8', 
              textDecoration: 'none',
              fontSize: '13px'
            }}
          >
            ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
