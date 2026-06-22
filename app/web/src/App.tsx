import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './app/page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<HomePage />} />
        <Route path="/account/signin" element={<HomePage />} />
        <Route path="/account/signup" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
