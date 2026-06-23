import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminPage from './app/app/make-admin/page';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function HomePage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '#/';
  };

  return (
    <div style={{ textAlign: 'center', direction: 'rtl', padding: '20px' }}>
      <h1>🚗 سوق السيارات</h1>
      {session ? (
        <div>
          <p>مرحباً، {session.user.email}!</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#/admin" style={{ padding: '10px 20px', background: '#8b5cf6', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              👑 لوحة التحكم
            </a>
            <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px' }}>
              تسجيل خروج
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>الموقع يعمل الآن!</p>
          <a href="#/login">تسجيل الدخول</a> | <a href="#/signup">إنشاء حساب</a>
        </div>
      )}
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center', direction: 'rtl', padding: '50px' }}>
      <h1>🔐 تسجيل الدخول</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '300px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '300px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 30px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? 'جاري...' : 'دخول'}
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        <a href="#/signup">إنشاء حساب</a> | <a href="#/">العودة للرئيسية</a>
      </p>
    </div>
  );
}

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      alert('تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center', direction: 'rtl', padding: '50px' }}>
      <h1>📝 إنشاء حساب</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '300px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '300px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 30px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? 'جاري...' : 'إنشاء حساب'}
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        لديك حساب؟ <a href="#/login">تسجيل الدخول</a>
      </p>
      <p>
        <a href="#/">العودة للرئيسية</a>
      </p>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
