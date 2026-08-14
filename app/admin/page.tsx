'use client';

import { useEffect, useState } from 'react';
import DashboardClient from '../DashboardClient';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">🔐 تسجيل الدخول</h1>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const password = formData.get('password');

              try {
                const res = await fetch('/api/admin/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ password }),
                });

                const data = await res.json();
                if (data.success) {
                  setIsAuthenticated(true);
                  window.location.reload();
                } else {
                  alert('كلمة المرور غير صحيحة');
                }
              } catch (error) {
                alert('حدث خطأ في تسجيل الدخول');
              }
            }}
          >
            <input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <DashboardClient />;
}
