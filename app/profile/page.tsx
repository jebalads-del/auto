'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUser({ email });
    }
  }, []);

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>👤 الملف الشخصي</h1>
      {user ? (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
          <p><strong>الدور:</strong> مستخدم عادي</p>
          <Link href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
            ← العودة إلى الرئيسية
          </Link>
        </div>
      ) : (
        <p>جاري التحميل...</p>
      )}
    </div>
  );
}
