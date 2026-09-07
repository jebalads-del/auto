'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import React from 'react';

export default function ProfilePage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h2>🔄 صفحة حساب المستخدم قيد التحديث</h2>
      <p>يمكنك الانتقال إلى لوحة التحكم الرئيسية لمتابعة العمل الإداري بسلام.</p>
      <a href="/dashboard/admin" style={{ display: 'inline-block', marginTop: '15px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
        🎛️ الانتقال إلى لوحة التحكم
      </a>
    </div>
  );
}
