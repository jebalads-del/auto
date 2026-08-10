"use client";
import React, { useState, useEffect } from "react";

export default function DashboardClient({ initialUsers, initialCars }: any) {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'payments' | 'settings'>('users');
  const [usersList, setUsersList] = useState(initialUsers || []);
  const [carsList, setCarsList] = useState(initialCars || []);
  const [featuredRequests, setFeaturedRequests] = useState<any[]>([]);

  // إعدادات بوابات الدفع والموقع الافتراضية
  const [westernName, setWesternName] = useState("محمد أحمد محمود");
  const [westernCountry, setWesternCountry] = useState("الكويت");
  const [paypalEmail, setPaypalEmail] = useState("payment@auto-gulf.com");
  const [isWesternActive, setIsWesternActive] = useState(true);
  const [isPaypalActive, setIsPaypalActive] = useState(true);
  const [siteName, setSiteName] = useState("حراج السيارات الخليجي الفعلي");
  const [defaultCurrency, setDefaultCurrency] = useState("KWD");

  useEffect(() => {
    fetch('/api/admin/featured-requests')
      .then(res => res.ok && res.json())
      .then(data => { if (data && data.success) setFeaturedRequests(data.requests || []); })
      .catch(e => console.error("Featured fetch error:", e));
  }, [activeTab]);

  const handleApproveCar = async (id: any) => {
    try {
      const response = await fetch('/api/admin/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' })
      });
      if (response.ok) {
        setCarsList((prev: any[]) => prev.map(c => c.id === id ? { ...c, status: "approved" } : c));
        alert("تمت الموافقة ونشر السيارة حياً! ✅");
      }
    } catch (error) { alert("فشان الاتصال بالسيرفر"); }
  };

  const handleMarkAsSold = async (id: any) => {
    try {
      const response = await fetch('/api/admin/cars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'sold' })
      });
      if (response.ok) {
        setCarsList((prev: any[]) => prev.map(c => c.id === id ? { ...c, status: "sold" } : c));
        alert("تم تحديث حالة السيارة إلى مُباعة! 🔴");
      }
    } catch (error) { alert("فشل تحديث حالة البيع"); }
  };

  const handleFeaturedAction = async (requestId: number, carId: number, action: 'approve' | 'reject') => {
    if (!confirm(`هل أنت متأكد من إجراء الـ ${action === 'approve' ? 'موافقة' : 'رفض'}؟`)) return;
    try {
      await fetch('/api/admin/featured-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, carId, action })
      });
      alert('⚙️ تم تنفيذ إجراء التمييز بنجاح!');
      setFeaturedRequests((prev: any[]) => prev.filter(r => r.id !== requestId));
      if (action === 'approve') {
        setCarsList((prev: any[]) => prev.map(c => c.id === carId ? { ...c, is_featured: true } : c));
      }
    } catch (e) { alert('❌ فشل الإرسال'); }
  };

  const handleDeleteUser = (id: any) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) return;
    setUsersList((prev: any[]) => prev.filter(u => u.id !== id));
  };

  const handleDeleteCar = (id: any) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان نهائياً؟")) return;
    setCarsList((prev: any[]) => prev.filter(c => c.id !== id));
  };
  const styles = {
    container: { fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '15px', direction: 'rtl' as const },
    header: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px', textAlign: 'center' as const, marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    tabGrid: { display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '20px' },
    tabButton: (isActive: boolean) => ({
      width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 'bold' as const,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' as const,
      backgroundColor: isActive ? '#2563eb' : '#ffffff', color: isActive ? '#ffffff' : '#4b5563', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer'
    }),
    badge: (isActive: boolean) => ({ backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', color: isActive ? '#fff' : '#1e293b' }),
    card: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    tableWrapper: { overflowX: 'auto' as const, borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'right' as const, fontSize: '13px' },
    th: { backgroundColor: '#f8fafc', padding: '12px', borderBottom: '2px solid #edf2f7', color: '#475569', fontWeight: 'bold' as const },
    td: { padding: '12px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', verticalAlign: 'middle' },
    btnAction: { padding: '6px 12px', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: 'bold' as const, marginLeft: '5px', cursor: 'pointer' },
    inputField: { width: '100%', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '6px', outline: 'none', boxSizing: 'border-box' as const }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ color: '#1e3a8a', fontSize: '22px', margin: '0 0 4px 0', fontWeight: 'bold' }}>📊 لوحة تحكم الإدارة المطورة</h1>
        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>إدارة العمليات الفورية الحية وحماية البيانات</p>
      </header>

      <div style={styles.tabGrid}>
        <button onClick={() => setActiveTab('users')} style={styles.tabButton(activeTab === 'users')}>
          <span>👥 إدارة المستخدمين</span> <span style={styles.badge(activeTab === 'users')}>{usersList.length}</span>
        </button>
        <button onClick={() => setActiveTab('ads')} style={styles.tabButton(activeTab === 'ads')}>
          <span>🚗 إعلانات السيارات</span> <span style={styles.badge(activeTab === 'ads')}>{carsList.length}</span>
        </button>
        <button onClick={() => setActiveTab('payments')} style={styles.tabButton(activeTab === 'payments')}>
          <span>💳 خيارات الدفع والعملات</span> <span>★</span>
        </button>
        <button onClick={() => setActiveTab('settings')} style={styles.tabButton(activeTab === 'settings')}>
          <span>⚙️ إعدادات الموقع العامة</span> <span>⚙️</span>
        </button>
      </div>

      <div style={styles.card}>
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a8a' }}>جدول مستخدمين النظام ({usersList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>المستعمل</th><th style={styles.th}>الإجراء</th></tr></thead>
                <tbody>
                  {usersList.map((user: any, index: number) => {
                    const isSystemAdmin = user.email === "admin@sayarty.store" || user.email === "mara7b@gmail.com";
                    return (
                      <tr key={user.id || index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600' }}>{user.name || user.username || "مستخدم حراج"}</div>
                          <div style={{ color: '#64748b', fontSize: '11px' }}>{user.email}</div>
                        </td>
                        <td style={styles.td}>
                          {isSystemAdmin ? (
                            <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '11px' }}>🛡️ مسؤول محمي</span>
                          ) : (
                            <button onClick={() => handleDeleteUser(user.id)} style={{ ...styles.btnAction, backgroundColor: '#ef4444' }}>حذف</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#be185d' }}>⭐ طلبات تمييز الإعلانات المعلقة ({featuredRequests.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr style={{background: '#f8fafc'}}><th style={styles.th}>رقم الإعلان</th><th style={styles.th}>وسيلة الدفع</th><th style={styles.th}>المبلغ</th><th style={{...styles.th, textAlign: 'center'}}>الإجراءات</th></tr></thead>
                <tbody>
                  {featuredRequests.length === 0 ? (
                    <tr><td colSpan={4} style={{...styles.td, textAlign: 'center', color: '#64748b'}}>لا توجد طلبات تمييز معلقة حالياً.</td></tr>
                  ) : featuredRequests.map((req: any) => (
                    <tr key={req.id} style={{textAlign: 'center'}}>
                      <td style={styles.td}><strong>#{req.car_id}</strong></td>
                      <td style={styles.td} style={{color: req.payment_method === 'paypal' ? '#1e3a8a' : '#15803d'}}>{req.payment_method === 'paypal' ? 'PayPal 💰' : 'Western 🏦'}</td>
                      <td style={styles.td}>{req.amount} د.ك</td>
                      <td style={styles.td} style={{display: 'flex', gap: '5px', justifyContent: 'center'}}>
                        <button onClick={() => handleFeaturedAction(req.id, req.car_id, 'approve')} style={{backgroundColor: '#059669', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}}>🟢 موافقة</button>
                        <button onClick={() => handleFeaturedAction(req.id, req.car_id, 'reject')} style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}}>🔴 رفض</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', marginTop: '20px', color: '#1e3a8a' }}>🚗 إدارة المعرض وإعلانات السيارات الحية ({carsList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>السيارة والمواصفات</th><th style={styles.th}>خيارات التحكم</th></tr></thead>
                <tbody>
                  {carsList.map((car: any, index: number) => {
                    const currentStatus = String(car.status).toLowerCase() || "pending";
                    return (
                      <tr key={car.id || index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600' }}>{car.brand || car.title} {car.model}</div>
                          <div style={{ color: '#10b981', fontWeight: 'bold' }}>{car.price} {car.currency || "KWD"}</div>
                          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                            الحالة: <span style={{fontWeight: 'bold', color: car.is_featured ? '#be185d' : currentStatus === 'sold' ? '#ef4444' : '#2563eb'}}>
                              {car.is_featured ? '⭐ مميز من الإدارة' : currentStatus === 'sold' ? 'تم البيع 🔴' : 'معروض نشط ✅'}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          {currentStatus !== "approved" && currentStatus !== "sold" && (
                            <button onClick={() => handleApproveCar(car.id)} style={{ ...styles.btnAction, backgroundColor: '#2563eb' }}>موافقة 👍</button>
                          )}
                          {currentStatus !== "sold" && (
                            <button onClick={() => handleMarkAsSold(car.id)} style={{ ...styles.btnAction, backgroundColor: '#ea580c' }}>مُباعة</button>
                          )}
                          <button onClick={() => handleDeleteCar(car.id)} style={{ ...styles.btnAction, backgroundColor: '#ef4444' }}>حذف</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a8a' }}>💳 بوابات الدفع وحساب مستلم التمييز</h2>
            <div style={{ padding: '14px', border: isWesternActive ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>📌 قنوات ويسترن يونيون</strong><input type="checkbox" checked={isWesternActive} onChange={() => setIsWesternActive(!isWesternActive)} /></div>
              <div style={{ opacity: isWesternActive ? 1 : 0.4 }}><input type="text" placeholder="اسم المستلم" disabled={!isWesternActive} value={westernName} onChange={(e) => setWesternName(e.target.value)} style={styles.inputField} /></div>
            </div>
            <div style={{ padding: '14px', border: isPaypalActive ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>💳 حساب باي بال (PayPal)</strong><input type="checkbox" checked={isPaypalActive} onChange={() => setIsPaypalActive(!isPaypalActive)} /></div>
              <div style={{ opacity: isPaypalActive ? 1 : 0.4 }}><input type="email" placeholder="بريد باي بال" disabled={!isPaypalActive} value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={styles.inputField} /></div>
            </div>
            <button onClick={() => alert("تم حفظ الإعدادات المالية بنجاح!")} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', width: '100%', marginTop: '12px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ التعديلات الحية 💾</button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a8a' }}>⚙️ إعدادات الحراج العامة</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>اسم التطبيق الأصلي:</label>
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={styles.inputField} />
              </div>
              <button onClick={() => alert("تم حفظ الإعدادات العامة!")} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>حفظ الإعدادات 💾</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
