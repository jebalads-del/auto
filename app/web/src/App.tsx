import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './login/page';

function HomePage() {
  return (
    <div style={{ textAlign: 'center', direction: 'rtl', padding: '20px' }}>
      <h1>🚗 سوق السيارات</h1>
      <p>الموقع يعمل الآن!</p>
      <a href="/login">تسجيل الدخول</a>
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
