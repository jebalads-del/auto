import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('تسجيل الدخول قيد التطوير');
  };

  return (
    <div style={{ textAlign: 'center', direction: 'rtl', padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>تسجيل الدخول</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>
          دخول
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
      </p>
      <p>
        ليس لديك حساب؟ <Link to="/signup">إنشاء حساب</Link>
      </p>
      <p>
        <Link to="/">العودة للرئيسية</Link>
      </p>
    </div>
  );
}
