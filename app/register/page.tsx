'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ التوجيه إلى صفحة التحقق مع الإيميل
        router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(data.error || data.message || 'حدث خطأ أثناء التسجيل');
      }
    } catch (error) {
      setError('فشل الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  // الأنماط
  const containerStyle = {
    maxWidth: '430px',
    margin: '100px auto',
    padding: '40px 30px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    textAlign: 'center' as const,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    direction: 'rtl' as const
  };

  const titleStyle = {
    fontSize: '22px',
    color: '#333333',
    marginBottom: '30px',
    fontWeight: '500'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    color: '#666666',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>إنشاء حساب جديد</h2>

      {error && (
        <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '15px' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="الاسم الكامل"
          required
          style={inputStyle}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          required
          style={inputStyle}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="كلمة السر"
          required
          minLength={6}
          style={inputStyle}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? 'جاري التسجيل...' : 'تسجيل الحساب'}
        </button>

        <div style={{ marginTop: '25px', fontSize: '15px', color: '#666666' }}>
          لديك حساب بالفعل؟{' '}
          <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none', marginRight: '5px' }}>
            تسجيل الدخول
          </Link>
        </div>
      </form>
    </div>
  );
}
