"use client";
import React, { useState, useEffect } from "react";
import { neon } from '@neondatabase/serverless';

// تجهيز دالة الاتصال بـ Neon DB باستخدام متغير البيئة السري المخزن في Vercel
const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL || process.env.DATABASE_URL || "";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'payments' | 'settings'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات الحقيقية من جداول Neon DB عند فتح الصفحة
  useEffect(() => {
    async function fetchNeonData() {
      if (!databaseUrl) {
        console.error("DATABASE_URL is missing!");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const sql = neon(databaseUrl);

        // 1. جلب كافة المستخدمين من جدول الـ users الحقيقي
        const usersData = await sql`SELECT * FROM users ORDER BY id DESC`;
        if (usersData) setUsers(usersData);

        // 2. جلب إعلانات السيارات من جدول الـ cars الحقيقي
        const carsData = await sql`SELECT * FROM cars ORDER BY id DESC`;
        if (carsData) setCars(carsData);
      } catch (error) {
        console.error("Error fetching Neon DB data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNeonData();
  }, []);

  // التنسيقات الانسيابية المضمونة للظهور بشكل جذاب على شاشة الهاتف
  const styles = {
    container: { fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '16px', direction: 'rtl' as const },
    header: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', textAlign: 'center' as const, marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    tabGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' },
    tabButton: (isActive: boolean) => ({
      padding: '14px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 'bold' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s',
      backgroundColor: isActive ? '#2563eb' : '#ffffff', color: isActive ? '#ffffff' : '#4b5563',
      boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
    }),
    badge: (isActive: boolean) => ({
      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
      color: isActive ? '#ffffff' : '#1e293b',
      padding: '2px 8px', borderRadius: '20px', fontSize: '11px', marginRight: '6px', fontWeight: 'bold' as const
    }),
    card: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    tableWrapper: { overflowX: 'auto' as const, borderRadius: '10px', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'right' as const, fontSize: '13px' },
    th: { backgroundColor: '#f8fafc', color: '#64748b', padding: '12px', borderBottom: '2px solid #edf2f7', fontWeight: '600' as const },
    td: { padding: '12px', borderBottom: '1px solid #f1f5f9', color: '#334155' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ color: '#1e3a8a', fontSize: '24px', margin: '0 0 6px 0', fontWeight: 'bold' }}>📊 لوحة تحكم المدير</h1>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>مستضاف على Vercel ومتصل بـ Neon DB</p>
      </header>

      {/* تبويبات الأقسام الأربعة */}
      <div style={styles.tabGrid}>
        <button onClick={() => setActiveTab('users')} style={styles.tabButton(activeTab === 'users')}>
          👥 المستخدمين <span style={styles.badge(activeTab === 'users')}>{loading ? '...' : users.length}</span>
        </button>
        <button onClick={() => setActiveTab('ads')} style={styles.tabButton(activeTab === 'ads')}>
          🚗 إعلانات السيارات <span style={styles.badge(activeTab === 'ads')}>{loading ? '...' : cars.length}</span>
        </button>
        <button onClick={() => setActiveTab('payments')} style={styles.tabButton(activeTab === 'payments')}>
          💳 خيارات الدفع <span style={styles.badge(activeTab === 'payments')}>0</span>
        </button>
        <button onClick={() => setActiveTab('settings')} style={styles.tabButton(activeTab === 'settings')}>
          ⚙️ الإعدادات
        </button>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>جاري جلب البيانات الحقيقية من Neon DB...</div>
        ) : (
          <>
            {/* 1. قسم المستخدمين الحقيقيين */}
            {activeTab === 'users' && (
              <div>
                <h2 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px', fontWeight: 'bold', borderRight: '4px solid #2563eb', paddingRight: '8px' }}>جدول إدارة المستخدمين الحقيقي ({users.length})</h2>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>الاسم</th>
                        <th style={styles.th}>البريد الإلكتروني</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.id || index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          <td style={styles.td}>{index + 1}</td>
                          <td style={{ ...styles.td, fontWeight: '500' }}>{user.name || user.username || "مستخدم حراج"}</td>
                          <td style={{ ...styles.td, color: '#2563eb' }}>{user.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. قسم إعلانات السيارات الحقيقية */}
            {activeTab === 'ads' && (
              <div>
                <h2 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px', fontWeight: 'bold', borderRight: '4px solid #2563eb', paddingRight: '8px' }}>إعلانات السيارات الفعالة ({cars.length})</h2>
                {cars.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>لا توجد سيارات مضافة حالياً في قاعدة بيانات Neon.</div>
                ) : (
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>السيارة</th>
                          <th style={styles.th}>السعر</th>
                          <th style={styles.th}>السنة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cars.map((car, index) => (
                          <tr key={car.id || index}>
                            <td style={{ ...styles.td, fontWeight: '500' }}>{car.brand || car.title} {car.model}</td>
                            <td style={{ ...styles.td, color: '#10b981', fontWeight: 'bold' }}>{car.price}</td>
                            <td style={styles.td}>{car.year}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. قسم خيارات الدفع */}
            {activeTab === 'payments' && (
              <div>
                <h2 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px', fontWeight: 'bold', borderRight: '4px solid #2563eb', paddingRight: '8px' }}>خيارات وبوابات الدفع</h2>
                <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                  <strong>💵 الدفع عند الاستلام (كاش)</strong>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>البوابة نشطة ومربوطة بنظام الفواتير المعتمد.</div>
                </div>
              </div>
            )}

            {/* 4. إعدادات الموقع */}
            {activeTab === 'settings' && (
              <div>
                <h2 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px', fontWeight: 'bold', borderRight: '4px solid #2563eb', paddingRight: '8px' }}>إعدادات الموقع العامة</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#475569' }}>اسم تطبيق الحراج الأصلي:</label>
                  <input type="text" defaultValue="حراج السيارات الفعلي" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }} />
                  <button style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حفظ الإعدادات</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

