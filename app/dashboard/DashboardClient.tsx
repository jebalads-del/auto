export const revalidate = 0;
"use client";
import React, { useState, useEffect } from "react";

export default function DashboardClient({ initialUsers, initialCars }: any) {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'payments' | 'settings'>('users');
  const [usersList, setUsersList] = useState(initialUsers || []);
  const [carsList, setCarsList] = useState(initialCars || []);
  const [featuredRequests, setFeaturedRequests] = useState<any[]>([]);
  const [westernName, setWesternName] = useState("محمد أحمد محمود");
  const [westernCountry, setWesternCountry] = useState("الكويت");
  const [paypalEmail, setPaypalEmail] = useState("payment@auto-gulf.com");
  const [isWesternActive, setIsWesternActive] = useState(true);
  const [isPaypalActive, setIsPaypalActive] = useState(true);
  const [siteName, setSiteName] = useState("حراج السيارات الخليجي الفعلي");
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState("KWD");
  const [allowedCurrencies, setAllowedCurrencies] = useState({ KWD: true, SAR: true, AED: true, QAR: true, BHD: true, OMR: true });

  useEffect(() => {
    fetch('/api/admin/featured-requests').then(res => res.ok && res.json())
      .then(data => { if (data && data.success) setFeaturedRequests(data.requests || []); })
      .catch(e => console.error(e));
  }, [activeTab]);

  const handleToggleCurrency = (code: string) => {
    if (code === defaultCurrency) return;
    setAllowedCurrencies(prev => ({ ...prev, [code]: !prev[code as keyof typeof prev] }));
  };
  const handleApproveCar = async (id: any) => {
    try {
      const response = await fetch('/api/admin/cars', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'approved' }) });
      if (response.ok) { setCarsList((prev: any[]) => prev.map(c => c.id === id ? { ...c, status: "approved" } : c)); alert("تمت الموافقة ونشر السيارة حياً! ✅"); }
    } catch (error) { alert("فشل الاتصال بالسيرفر"); }
  };

  const handleMarkAsSold = async (id: any) => {
    try {
      const response = await fetch('/api/admin/cars', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'sold' }) });
      if (response.ok) { setCarsList((prev: any[]) => prev.map(c => c.id === id ? { ...c, status: "sold" } : c)); alert("تم تحديث حالة السيارة إلى مُباعة! 🔴"); }
    } catch (error) { alert("فشل تحديث حالة البيع"); }
  };

  const handleFeaturedAction = async (requestId: number, carId: number, action: 'approve' | 'reject') => {
    if (!confirm(`هل أنت متأكد من إجراء الـ ${action === 'approve' ? 'موافقة' : 'رفض'}؟`)) return;
    try {
      await fetch('/api/admin/featured-actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, carId, action }) });
      alert('⚙️ تم تنفيذ إجراء التمييز بنجاح!');
      setFeaturedRequests(prev => prev.filter(r => r.id !== requestId));
      if (action === 'approve') setCarsList((prev: any[]) => prev.map(c => c.id === carId ? { ...c, is_featured: true } : c));
    } catch (e) { alert('❌ فشل الإرسال'); }
  };

  const styles = {
    container: { fontFamily: 'sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '12px', direction: 'rtl' as const },
    header: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', textAlign: 'center' as const, marginBottom: '16px' },
    tabGrid: { display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '20px' },
    tabButton: (isActive: boolean) => ({ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 'bold' as const, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isActive ? '#2563eb' : '#ffffff', color: isActive ? '#ffffff' : '#4b5563' }),
    badge: (isActive: boolean) => ({ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9', padding: '2px 8px', borderRadius: '20px', color: isActive ? '#fff' : '#000' }),
    card: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px' },
    tableWrapper: { overflowX: 'auto' as const, borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '15px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'right' as const, fontSize: '13px' },
    th: { backgroundColor: '#f8fafc', padding: '10px', borderBottom: '2px solid #edf2f7' },
    td: { padding: '10px', borderBottom: '1px solid #f1f5f9' },
    btnAction: { padding: '6px 10px', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: 'bold' as const, marginLeft: '4px', cursor: 'pointer' },
    inputField: { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px', outline: 'none', boxSizing: 'border-box' as const }
  };
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ color: '#1e3a8a', fontSize: '20px', margin: '0 0 4px 0', fontWeight: 'bold' }}>📊 لوحة تحكم المدير</h1>
        <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>نظام إدارة العمليات الحية الفوري</p>
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
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>جدول المستخدمين ({usersList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>المستعمل</th><th style={styles.th}>الإجراء</th></tr></thead>
                <tbody>
                  {usersList.map((user: any, index: number) => (
                    <tr key={user.id || index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600' }}>{user.name || user.username || "مستخدم حراج"}</div>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>{user.email}</div>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => setUsersList((p:any)=>p.filter((u:any)=>u.id!==user.id))} style={{ ...styles.btnAction, backgroundColor: '#ef4444' }}>حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#be185d' }}>⭐ طلبات تمييز الإعلانات قيد الانتظار ({featuredRequests.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr style={{background: '#f8fafc'}}><th style={styles.th}>رقم</th><th style={styles.th}>الدفع</th><th style={styles.th}>المبلغ</th><th style={{...styles.th, textAlign: 'center'}}>الإجراءات</th></tr></thead>
                <tbody>
                  {featuredRequests.length === 0 ? (
                    <tr><td colSpan={4} style={{...styles.td, textAlign: 'center', color: '#64748b'}}>لا توجد طلبات معلقة.</td></tr>
                  ) : featuredRequests.map((req: any) => (
                    <tr key={req.id} style={{textAlign: 'center'}}>
                      <td style={styles.td}><strong>#{req.car_id}</strong></td>
                      <td style={{ ...styles.td, color: req.payment_method === 'paypal' ? '#1e3a8a' : '#15803d' }}>{req.payment_method === 'paypal' ? 'PayPal 💰' : 'Western 🏦'}</td>
                      <td style={styles.td}>{req.amount} د.ك</td>
                      <td style={{ ...styles.td, display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button onClick={() => handleFeaturedAction(req.id, req.car_id, 'approve')} style={{backgroundColor: '#059669', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}}>🟢 موافقة</button>
                        <button onClick={() => handleFeaturedAction(req.id, req.car_id, 'reject')} style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}}>🔴 رفض</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', marginTop: '20px' }}>إعلانات السيارات الفعالة ({carsList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>السيارة والسعر</th><th style={styles.th}>الإجراءات</th></tr></thead>
                <tbody>
                  {carsList.map((car: any, index: number) => {
                    const currentStatus = String(car.status).toLowerCase() || "pending";
                    return (
                      <tr key={car.id || index}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600' }}>{car.brand || car.title} {car.model}</div>
                          <div style={{ color: '#10b981', fontWeight: 'bold' }}>{car.price} {car.currency || "KWD"}</div>
                          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                            الحالة: <span style={{fontWeight: 'bold', color: car.is_featured ? '#be185d' : currentStatus === 'sold' ? '#ef4444' : '#2563eb'}}>
                              {car.is_featured ? '⭐ مميز ' : currentStatus === 'sold' ? 'تم البيع 🔴' : 'معروض ✅'}
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
                          <button onClick={()=>setCarsList((p:any)=>p.filter((c:any)=>c.id!==car.id))} style={{ ...styles.btnAction, backgroundColor: '#ef4444' }}>حذف</button>
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
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a8a' }}>💱 تخصيص العملات الخليجية</h2>
            <div style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
              <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="KWD">🇰🇼 دينار كويتي</option>
                <option value="SAR">🇸🇦 ريال سعودي</option>
                <option value="AED">🇦🇪 درهم إماراتي</option>
              </select>
            </div>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>💳 بوابات الدفع وحساب المستلم</h2>
            <div style={{ padding: '12px', border: isWesternActive ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>📌 ويسترن يونيون</strong><input type="checkbox" checked={isWesternActive} onChange={() => setIsWesternActive(!isWesternActive)} /></div>
              <div style={{ opacity: isWesternActive ? 1 : 0.4 }}><input type="text" placeholder="اسم المستلم" disabled={!isWesternActive} value={westernName} onChange={(e) => setWesternName(e.target.value)} style={styles.inputField} /></div>
            </div>
            <div style={{ padding: '12px', border: isPaypalActive ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>💳 باي بال (PayPal)</strong><input type="checkbox" checked={isPaypalActive} onChange={() => setIsPaypalActive(!isPaypalActive)} /></div>
              <div style={{ opacity: isPaypalActive ? 1 : 0.4 }}><input type="email" placeholder="بريد باي بال" disabled={!isPaypalActive} value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={styles.inputField} /></div>
            </div>
            <button onClick={() => alert("تم الحفظ!")} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', width: '100%', marginTop: '12px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ التعديلات الحية 💾</button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>إعدادات الموقع العامة</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} style={styles.inputField} />
              <button onClick={() => alert("تم الحفظ!")} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>حفظ الإعدادات 💾</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
