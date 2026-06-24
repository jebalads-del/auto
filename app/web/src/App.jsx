import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Admin from './pages/Admin';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  return (
    <BrowserRouter>
      <nav style={{ textAlign: 'center', padding: '10px', background: '#f0f0f0' }}>
        <Link to="/">الرئيسية</Link>
        {!session ? (
          <>
            | <Link to="/login">دخول</Link>
            | <Link to="/register">تسجيل</Link>
          </>
        ) : (
          <>
            | <Link to="/admin">لوحة التحكم</Link>
            | <button onClick={() => supabase.auth.signOut()}>خروج</button>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
