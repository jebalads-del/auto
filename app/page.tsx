'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  kilometers: number;
  color: string;
  description: string;
  images: string[];
  status: string;
  created_at: string;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cars, setCars] = useState<Car[]>([]);

  // جلب الإعلانات الموافق عليها
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      const data = await response.json();
      if (data.success) {
        setCars(data.cars);
      }
    } catch (error) {
      console.error('خطأ في جلب الإعلانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('✅ تم إرسال كود التحقق بنجاح!');
        setView('otp');
      } else {
        setError(data.error || 'خطأ في التسجيل');
      }
    } catch {
      setError('❌ خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        alert('🎉 تم تفعيل الحساب بنجاح!');
        window.location.href = '/login';
      } else {
        setError('كود التحقق خاطئ');
      }
    } catch {
      setError('خطأ في التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    const isLoggedIn = localStorage.getItem('isAdmin') === 'true';
    if (!isLoggedIn) {
      e.preventDefault();
      window.location.href = '/login?redirect=/dashboard/cars/new';
    }
  };

  const styIn = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '12px',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        direction: 'rtl',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '15px',
        textAlign: 'right',
      }}
    >
      {/* رسالة ثابتة للتحقق */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          background: '#dc2626',
          color: 'white',
          padding: '14px',
          fontSize: '22px',
          zIndex: 9999,
          textAlign: 'center',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        }}
      >
        ✅ النسخة الجديدة 2.0 - تم التحديث بنجاح! 🚀
      </div>

      <div style={{ paddingTop: '70px' }}>
        <header
          style={{
            backgroundColor: '#1e293b',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            color: 'white',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h1
              onClick={() => setView('home')}
              style={{
                color: '#38bdf8',
                margin: 0,
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              🚗 سيارتي
            </h1>
            <Link
              href="/dashboard/cars/new"
              onClick={handleAddClick}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              ➕ إعلان مجاني
            </Link>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '10px',
              fontSize: '12px',
              color: '#cbd5e1',
            }}
          >
            <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>
              دخول
            </Link>
            <span>|</span>
            <span
              onClick={() => setView('reg')}
              style={{
                cursor: 'pointer',
                color: view === 'reg' ? '#38bdf8' : '#fff',
              }}
            >
              تسجيل
            </span>
          </div>
        </header>

        {error && (
          <div
            style={{
              color: 'red',
              textAlign: 'center',
              marginBottom: '15px',
            }}
          >
            ❌ {error}
          </div>
        )}
        {success && (
          <div
            style={{
              color: 'green',
              textAlign: 'center',
              marginBottom: '15px',
            }}
          >
            ✅ {success}
          </div>
        )}

        {/* ✅ عرض الإعلانات الموافق عليها */}
        {view === 'home' && (
          <main>
            <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>🚗 السيارات المتاحة</h2>
            {loading ? (
              <p>جاري التحميل...</p>
            ) : cars.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                لا توجد سيارات متاحة حالياً
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px',
                }}
              >
                {cars.map((car) => (
                  <div
                    key={car.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = 'scale(1.02)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = 'scale(1)')
                    }
                  >
                    <div style={{ padding: '15px' }}>
                      <h3 style={{ fontSize: '18px', margin: '0 0 5px 0' }}>
                        {car.brand} {car.model}
                      </h3>
                      <p style={{ color: '#2563eb', fontSize: '20px', fontWeight: 'bold', margin: '5px 0' }}>
                        ${car.price.toLocaleString()}
                      </p>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '5px',
                          fontSize: '14px',
                          color: '#64748b',
                          marginTop: '10px',
                        }}
                      >
                        <span>📅 {car.year}</span>
                        <span>📏 {car.kilometers?.toLocaleString() || 0} كم</span>
                        <span>🎨 {car.color || 'غير محدد'}</span>
                        <span>📅 {new Date(car.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      {car.description && (
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '10px' }}>
                          {car.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {view === 'reg' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <form
              onSubmit={handleRegister}
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '350px',
              }}
            >
              <h3>إنشاء حساب جديد</h3>
              <input
                placeholder="الاسم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styIn}
                required
              />
              <input
                type="email"
                placeholder="البريد"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styIn}
                required
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styIn}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: loading ? '#93c5fd' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'جاري الإرسال...' : 'إرسال الكود 2 ✅'}
              </button>
            </form>
          </div>
        )}

        {view === 'otp' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <form
              onSubmit={handleVerifyOtp}
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '350px',
              }}
            >
              <h3>التحقق من البريد</h3>
              <p style={{ textAlign: 'center', color: '#666' }}>
                الكود أُرسل إلى: <strong>{email}</strong>
              </p>
              <input
                type="text"
                placeholder="أدخل الكود (6 أرقام)"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                style={styIn}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: loading ? '#93c5fd' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'جاري التحقق...' : 'تحقق'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
