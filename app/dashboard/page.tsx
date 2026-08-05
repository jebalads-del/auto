"use client";
import React, { useState } from 'react';

const initialUsers = [
  { id: 1, name: "KXRIDLKYQilRqlkIhh", email: "ak-jak@hotmail.com", status: "عادي" },
  { id: 2, name: "qELzFnGDEnhVqOMZCTWuhNQ", email: "karen@advancedlightandsound.com", status: "عادي" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'payments' | 'settings'>('users');

  const containerStyle: React.CSSProperties = {
    fontFamily: 'sans-serif',
    backgroundColor: '#f3f4f6',
    minHeight: '100vh',
    padding: '16px',
    direction: 'rtl'
  };

  return (
    <div style={containerStyle}>
      <header style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h1 style={{ color: '#1d4ed8', fontSize: '22px', margin: '0 0 4px 0', fontWeight: 'bold' }}>📊 لوحة تحكم المدير</h1>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>مستضاف على Vercel & Neon DB</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', backgroundColor: activeTab === 'users' ? '#1d4ed8' : '#ffffff', color: activeTab === 'users' ? '#ffffff' : '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          👥 المستخدمين <span style={{ background: activeTab === 'users' ? 'rgba(255,255,255,0.2)' : '#e5e7eb', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', marginRight: '4px' }}>43</span>
        </button>
        <button onClick={() => setActiveTab('ads')} style={{ padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', backgroundColor: activeTab === 'ads' ? '#1d4ed8' : '#ffffff', color: activeTab === 'ads' ? '#ffffff' : '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          🚗 الإعلانات <span style={{ background: activeTab === 'ads' ? 'rgba(255,255,255,0.2)' : '#e5e7eb', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', marginRight: '4px' }}>0</span>
        </button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', backgroundColor: activeTab === 'payments' ? '#1d4ed8' : '#ffffff', color: activeTab === 'payments' ? '#ffffff' : '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          💳 المدفوعات <span style={{ background: activeTab === 'payments' ? 'rgba(255,255,255,0.2)' : '#e5e7eb', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', marginRight: '4px' }}>0</span>
        </button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '13px', backgroundColor: activeTab === 'settings' ? '#1d4ed8' : '#ffffff', color: activeTab === 'settings' ? '#ffffff' : '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          ⚙️ الإعدادات
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '16px', color: '#1f2937', marginBottom: '12px', borderRight: '4px solid #1d4ed8', paddingRight: '8px', fontWeight: 'bold' }}>جدول إدارة المستخدمين</h2>
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '10px', color: '#4b5563' }}>#</th>
                    <th style={{ padding: '10px', color: '#4b5563' }}>الاسم</th>
                    <th style={{ padding: '10px', color: '#4b5563' }}>البريد الإلكتروني</th>
                  </tr>
                </thead>
                <tbody>
                  {initialUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px' }}>{user.id}</td>
                      <td style={{ padding: '10px', fontWeight: '500' }}>{user.name}</td>
                      <td style={{ padding: '10px', color: '#1d4ed8' }}>{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🚗</div>
            <h3 style={{ color: '#4b5563', fontWeight: 'bold' }}>إعلانات السيارات</h3>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>لا توجد إعلانات سيارات بانتظار المراجعة حالياً.</p>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h2 style={{ fontSize: '16px', color: '#1f2937', marginBottom: '12px', borderRight: '4px solid #1d4ed8', paddingRight: '8px', fontWeight: 'bold' }}>خيارات بوابات الدفع</h2>
            <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
              <strong style={{ fontSize: '14px' }}>الدفع عند الاستلام (كاش)</strong>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>البوابة مفعلة بشكل افتراضي.</div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '16px', color: '#1f2937', marginBottom: '12px', borderRight: '4px solid #1d4ed8', paddingRight: '8px', fontWeight: 'bold' }}>إعدادات الموقع العامة</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: '#4b5563' }}>اسم الموقع:</label>
              <input type="text" placeholder="حراج السيارات" style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
              <button style={{ backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '4px' }}>حفظ التعديلات</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
