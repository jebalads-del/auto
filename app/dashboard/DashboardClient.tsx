"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';

export default function DashboardClient({ initialUsers, initialCars }: { initialUsers: any[], initialCars: any[] }) {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'payments' | 'settings'>('users');
  const [usersList, setUsersList] = useState(initialUsers || []);
  const [carsList, setCarsList] = useState(initialCars || []);
  const [stats, setStats] = useState({ users: 0, cars: 0, pending: 0, approved: 0 });

  useEffect(() => {
    // تحديث الإحصائيات
    const pending = carsList.filter((c: any) => c.status === 'pending');
    const approved = carsList.filter((c: any) => c.status === 'approved' || c.status === 'active');
    setStats({
      users: usersList.length,
      cars: carsList.length,
      pending: pending.length,
      approved: approved.length
    });
  }, [usersList, carsList]);

  const handleApproveCar = async (id: any) => {
    try {
      const response = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (response.ok) {
        setCarsList(prev => prev.map((c: any) => c.id === id ? { ...c, status: "approved" } : c));
        alert("✅ تمت الموافقة ونشر السيارة!");
      } else {
        alert("❌ فشل الموافقة");
      }
    } catch (error) {
      alert("❌ فشل الاتصال بالسيرفر");
    }
  };

  const handleDeleteCar = async (id: any) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    try {
      const response = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCarsList(prev => prev.filter((c: any) => c.id !== id));
        alert("✅ تم حذف الإعلان");
      } else {
        alert("❌ فشل الحذف");
      }
    } catch (error) {
      alert("❌ فشل الاتصال بالسيرفر");
    }
  };

  const styles = {
    container: { direction: 'rtl' as const, padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh' },
    header: { backgroundColor: '#1e293b', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
    headerTitle: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
    headerSub: { fontSize: '14px', color: '#94a3b8', margin: '5px 0 0 0' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' },
    statCard: { backgroundColor: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' as const, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    statNumber: { fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' },
    statLabel: { fontSize: '12px', color: '#64748b', margin: '5px 0 0 0' },
    tabGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' },
    tabButton: (isActive: boolean) => ({
      padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 'bold' as const,
      backgroundColor: isActive ? '#2563eb' : 'white', color: isActive ? 'white' : '#475569',
      cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }),
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    tableWrapper: { overflowX: 'auto' as const },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'right' as const, fontSize: '14px' },
    th: { padding: '12px', borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' },
    td: { padding: '12px', borderBottom: '1px solid #f1f5f9' },
    btnApprove: { padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginLeft: '5px' },
    btnDelete: { padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    btnLink: { display: 'inline-block', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', textAlign: 'center' as const }
  };

  return (
    <div style={styles.container}>
      {/* الهيدر */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>🚗 لوحة تحكم الإدارة المطورة</h1>
        <p style={styles.headerSub}>مرحباً بك في لوحة التحكم</p>
      </header>

      {/* الإحصائيات */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{stats.users}</h3>
          <p style={styles.statLabel}>👥 المستخدمين</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{stats.cars}</h3>
          <p style={styles.statLabel}>🚗 السيارات</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{stats.pending}</h3>
          <p style={styles.statLabel}>⏳ قيد الانتظار</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{stats.approved}</h3>
          <p style={styles.statLabel}>✅ مقبولة</p>
        </div>
      </div>

      {/* أزرار التبويب */}
      <div style={styles.tabGrid}>
        <button onClick={() => setActiveTab('users')} style={styles.tabButton(activeTab === 'users')}>👥 المستخدمين</button>
        <button onClick={() => setActiveTab('ads')} style={styles.tabButton(activeTab === 'ads')}>🚗 الإعلانات</button>
        <button onClick={() => setActiveTab('payments')} style={styles.tabButton(activeTab === 'payments')}>💳 الدفع</button>
        <button onClick={() => setActiveTab('settings')} style={styles.tabButton(activeTab === 'settings')}>⚙️ الإعدادات</button>
      </div>

      {/* المحتوى */}
      <div style={styles.card}>
        {activeTab === 'users' && (
          <div>
            <h2>👥 إدارة المستخدمين ({usersList.length})</h2>
            <Link href="/dashboard/users" style={styles.btnLink}>إدارة المستخدمين →</Link>
          </div>
        )}

        {activeTab === 'ads' && (
          <div>
            <h2>🚗 إدارة الإعلانات ({carsList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>السيارة</th>
                    <th style={styles.th}>السعر</th>
                    <th style={styles.th}>الحالة</th>
                    <th style={styles.th}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {carsList.map((car: any) => (
                    <tr key={car.id}>
                      <td style={styles.td}>{car.brand} {car.model}</td>
                      <td style={styles.td}>{car.price} {car.currency || 'KWD'}</td>
                      <td style={styles.td}>{car.status === 'approved' ? '✅ مقبول' : car.status === 'pending' ? '⏳ انتظار' : car.status}</td>
                      <td style={styles.td}>
                        {car.status === 'pending' && (
                          <button onClick={() => handleApproveCar(car.id)} style={styles.btnApprove}>موافقة</button>
                        )}
                        <button onClick={() => handleDeleteCar(car.id)} style={styles.btnDelete}>حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href="/dashboard/cars/new" style={styles.btnLink}>➕ إضافة سيارة</Link>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h2>💳 خيارات الدفع</h2>
            <p>إعدادات الدفع قيد التطوير</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2>⚙️ إعدادات الموقع</h2>
            <p>الإعدادات قيد التطوير</p>
          </div>
        )}
      </div>
    </div>
  );
}
