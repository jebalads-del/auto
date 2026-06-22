import { BrowserRouter, Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ textAlign: 'center', direction: 'rtl', padding: '20px' }}>
      <h1>🚗 سوق السيارات</h1>
      <p>الموقع يعمل الآن!</p>
      <a href="/login">تسجيل الدخول</a>
    </div>
  );
}

function LoginPage() {
  return (
    <div style={{ textAlign: 'center', direction: 'rtl', padding: '50px' }}>
      <h1>🔐 تسجيل الدخول</h1>
      <p>هذه صفحة تسجيل الدخول (مضمنة في App.tsx)</p>
      <a href="/">العودة للرئيسية</a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account/signin" element={<LoginPage />} />
        <Route path="/account/signup" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
