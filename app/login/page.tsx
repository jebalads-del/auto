'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

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
      if (!email || !password) {
        setError('الرجاء ملء جميع الحقول');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userId = data.user?.id || data.userId || '1';
        const userRole = data.user?.role || 'user';
        const userEmail = email;

        // ✅ حفظ الجلسة في Cookies (تدوم 7 أيام)
        Cookies.set('isAdmin', 'true', { expires: 7, path: '/' });
        Cookies.set('userId', userId.toString(), { expires: 7, path: '/' });
        Cookies.set('userEmail', userEmail, { expires: 7, path: '/' });
        Cookies.set('userRole', userRole, { expires: 7, path: '/' });

        // ✅ حفظ في localStorage كاحتياطي
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userRole', userRole);

        console.log('✅ تم حفظ الجلسة:', { userId, userRole });

        const redirectPath = data.redirect || '/dashboard';
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

  // ... باقي الكود (نفسه)
}
