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
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // ✅ حفظ جلسة المستخدم
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', data.user.id.toString());
      
      // ✅ الحصول على مسار إعادة التوجيه
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
    <div style={{ padding: '20px', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ color: '#0070f3', fontWeight: 'bold', textDecoration: 'none' }}>← العودة للمنزل</Link>
      </header>

      <div style={{ 
        maxWidth: '400px', 
        margin: '60px auto', 
        padding: '30px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        backgroundColor: '#fff' 
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>تسجيل الدخول والإدارة</h1>

        {error && (
          <div style={{ 
            backgroundColor: '#fee', 
            padding: '10px', 
            borderRadius: '5px', 
            color: '#c33', 
            marginBottom: '20px', 
            textAlign: 'center', 
            fontWeight: 'bold' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              البريد الإلكتروني للإدارة:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '4px', 
                boxSizing: 'border-box' 
              }}
              placeholder="example@email.com"
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              كلمة المرور:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '4px', 
                boxSizing: 'border-box' 
              }}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0070f3',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
