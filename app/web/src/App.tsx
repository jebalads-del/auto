import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
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
  // ... (نفس الكود السابق)
}

function SignupPage() {
  // ... (نفس الكود السابق)
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
