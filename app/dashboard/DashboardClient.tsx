"use client";
import React, { useState } from "react";

export default function DashboardClient({ initialUsers, initialCars }: { initialUsers: any[], initialCars: any[] }) {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'payments' | 'settings'>('users');
  const [usersList, setUsersList] = useState(initialUsers);
  const [carsList, setCarsList] = useState(initialCars);

  // حسابات الدفع والبيانات الافتراضية للمستلم
  // حالات خاصة بإعدادات الدفع الحية وتفعيل البوابات
  const [westernName, setWesternName] = useState("محمد أحمد محمود");
  const [westernCountry, setWesternCountry] = useState("الكويت");
  const [paypalEmail, setPaypalEmail] = useState("payment@auto-gulf.com");

  // الحالات الجديدة للتحكم في تفعيل البوابات بنقرة واحدة (True أو False)
  const [isWesternActive, setIsWesternActive] = useState(true);
  const [isPaypalActive, setIsPaypalActive] = useState(true);

  // دالة الحفظ المحدثة لإرسال حالة البوابات المفعلة
  const handleSavePayments = () => {
    alert(`تم حفظ الإعدادات بنجاح!\nويسترن يونيون: ${isWesternActive ? "مفعلة ✅" : "معطلة ❌"}\nباي بال: ${isPaypalActive ? "مفعلة ✅" : "معطلة ❌"}`);
  };

  // دالة تفعيل أو إيقاف المستخدمين
  const handleToggleUserStatus = (id: any, currentStatus: string) => {
    const nextStatus = currentStatus === "موقوف" ? "نشط" : "موقوف";
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    alert(`تم تحديث حالة المستخدم بنجاح إلى: ${nextStatus}`);
  };

  // دالة حذف مستخدم
  const handleDeleteUser = (id: any) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      setUsersList(prev => prev.filter(u => u.id !== id));
    }
  };

  // دالة الموافقة على الإعلان
  const handleApproveCar = (id: any) => {
    setCarsList(prev => prev.map(c => c.id === id ? { ...c, ad_status: "تمت الموافقة" } : c));
    alert("تمت الموافقة على الإعلان ونشره الحراج.");
  };

  // دالة وسم الإعلان كمباع
  const handleMarkAsSold = (id: any) => {
    setCarsList(prev => prev.map(c => c.id === id ? { ...c, ad_status: "مُباعة 🔴" } : c));
    alert("تم تحويل حالة السيارة إلى مباعة.");
  };

  // دالة حذف إعلان
  const handleDeleteCar = (id: any) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
      setCarsList(prev => prev.filter(c => c.id !== id));
    }
  };
  const styles = {
    container: { fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '16px', direction: 'rtl' as const },
    header: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', textAlign: 'center' as const, marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    tabGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' },
    tabButton: (isActive: boolean) => ({
      padding: '14px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: 'bold' as const, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      backgroundColor: isActive ? '#2563eb' : '#ffffff', color: isActive ? '#ffffff' : '#4b5563', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }),
    badge: (isActive: boolean) => ({
      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: isActive ? '#ffffff' : '#1e293b', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', marginRight: '6px'
    }),
    card: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    sectionTitle: { fontSize: '16px', color: '#1e293b', marginBottom: '16px', fontWeight: 'bold' as const, borderRight: '4px solid #2563eb', paddingRight: '8px' },
    
tableWrapper: { overflowX: 'auto' as const, borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'right' as const, fontSize: '13px' },
    th: { backgroundColor: '#f8fafc', color: '#64748b', padding: '12px', borderBottom: '2px solid #edf2f7' },
    td: { padding: '12px', borderBottom: '1px solid #f1f5f9', color: '#334155' },
    btnAction: { padding: '6px 10px', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: 'bold' as const, cursor: 'pointer', marginLeft: '4px' },
    inputField: { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', marginTop: '4px', outline: 'none', boxSizing: 'border-box' as const }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ color: '#1e3a8a', fontSize: '22px', margin: '0 0 6px 0', fontWeight: 'bold' }}>📊 لوحة تحكم المدير</h1>
        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>نظام إدارة العمليات الحية الفوري</p>
      </header>

      <div style={styles.tabGrid}>
        <button onClick={() => setActiveTab('users')} style={styles.tabButton(activeTab === 'users')}>
          👥 المستخدمين <span style={styles.badge(activeTab === 'users')}>{usersList.length}</span>
        </button>
        <button onClick={() => setActiveTab('ads')} style={styles.tabButton(activeTab === 'ads')}>
          🚗 الإعلانات <span style={styles.badge(activeTab === 'ads')}>{carsList.length}</span>
        </button>
          💳 المدفوعات <span style={styles.badge(activeTab === 'payments')}>2</span>
                {/* بوابات الدفع ويسترن يونيون وباي بال المحدثة بالكامل مع أزرار التفعيل التفاعلية */}
        {activeTab === 'payments' && (
          <div>
         <h2 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '16px', fontWeight: 'bold', borderRight: '4px solid #2563eb', paddingRight: '8px' }}>إعداد بوابات الدفع وحسابات المستلم</h2>
            
            {/* 1. بوابة ويسترن يونيون */}
            <div style={{ padding: '16px', border: isWesternActive ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', backgroundColor: '#fff', transition: 'all 0.2s', relative: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#d97706', fontSize: '15px' }}>📌 بوابة ويسترن يونيون (Western Union)</strong>
                <button 
                  onClick={() => setIsWesternActive(!isWesternActive)} 
                  style={{ backgroundColor: isWesternActive ? '#10b981' : '#6b7280', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isWesternActive ? "✓ مفعلة" : "تعطيل"}
                </button>
              </div>
              <div style={{ opacity: isWesternActive ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                <label style={{ fontSize: '12px', color: '#4b5563' }}>اسم المستلم الكامل (باللغة الإنجليزية كما في البطاقة):</label>
                <input type="text" disabled={!isWesternActive} value={westernName} onChange={(e) => setWesternName(e.target.value)} style={styles.inputField} />
                <label style={{ fontSize: '12px', display: 'block', marginTop: '6px', color: '#4b5563' }}>بلد المستلم:</label>
                <input type="text" disabled={!isWesternActive} value={westernCountry} onChange={(e) => setWesternCountry(e.target.value)} style={styles.inputField} />
              </div>
            </div>

            {/* 2. بوابة باي بال */}
            <div style={{ padding: '16px', border: isPaypalActive ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#2563eb', fontSize: '15px' }}>💳 بوابة باي بال الإلكترونية (PayPal)</strong>
                <button 
                  onClick={() => setIsPaypalActive(!isPaypalActive)} 
                  style={{ backgroundColor: isPaypalActive ? '#10b981' : '#6b7280', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isPaypalActive ? "✓ مفعلة" : "تعطيل"}
                </button>
              </div>
              <div style={{ opacity: isPaypalActive ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                <label style={{ fontSize: '12px', color: '#4b5563' }}>حساب البريد الإلكتروني المربوط للاستلام:</label>
                <input type="email" disabled={!isPaypalActive} value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={styles.inputField} />
              </div>
            </div>

            {/* زر الحفظ النهائي */}
            <button onClick={handleSavePayments} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', width: '100%', marginTop: '16px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.1)' }}>
              حفظ خيارات الدفع 💾
            </button>
          </div>
        )}

        <button onClick={() => setActiveTab('settings')} style={styles.tabButton(activeTab === 'settings')}>
          ⚙️ الإعدادات
        </button>
      </div>

      <div style={styles.card}>
        {/* قسم جداول المستخدمين */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>جدول إدارة المستخدمين الحقيقي ({usersList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>المستعمل</th>
                    <th style={styles.th}>الحالة</th>
                    <th style={styles.th}>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user, index) => {
                    const currentStatus = user.status || "نشط";
                    return (
                      <tr key={user.id || index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600' }}>{user.name || user.username || "مستخدم حراج"}</div>
                          <div style={{ color: '#64748b', fontSize: '11px' }}>{user.email}</div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ backgroundColor: currentStatus === 'موقوف' ? '#fee2e2' : '#dcfce7', color: currentStatus === 'موقوف' ? '#ef4444' : '#15803d', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                            {currentStatus}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => handleToggleUserStatus(user.id, currentStatus)} style={{ ...styles.btnAction, backgroundColor: currentStatus === 'موقوف' ? '#10b981' : '#f59e0b' }}>
                            {currentStatus === 'موقوف' ? "تفعيل" : "إيقاف"}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} style={{ ...styles.btnAction, backgroundColor: '#ef4444' }}>حذف</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* تحسينات جداول السيارات الفعالة والمباعة */}
        {activeTab === 'ads' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>إعلانات السيارات الفعالة ({carsList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>السيارة والسعر</th>
                    <th style={styles.th}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {carsList.map((car, index) => {
                    const statusText = car.ad_status || "بانتظار المراجعة";
                    return (
                      <tr key={car.id || index}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600' }}>{car.brand || car.title} {car.model}</div>
                          <div style={{ color: '#10b981', fontWeight: 'bold' }}>{car.price}</div>
                        </td>
                        <td style={styles.td}>
                          {statusText === "بانتظار المراجعة" && (
                            <button onClick={() => handleApproveCar(car.id)} style={{ ...styles.btnAction, backgroundColor: '#2563eb' }}>موافقة</button>
                          )}
                          <button onClick={() => handleMarkAsSold(car.id)} style={{ ...styles.btnAction, backgroundColor: '#10b981' }}>مُباعة</button>
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

        {/* بوابات الدفع ويسترن يونيون وباي بال وتحديث بيانات المستلم */}
        {activeTab === 'payments' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>إعداد بوابات الدفع وحسابات المستلم</h2>
            <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px' }}>
              <strong style={{ color: '#d97706', fontSize: '14px' }}>📌 بوابة ويسترن يونيون</strong>
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '12px' }}>اسم المستلم الكامل:</label>
                <input type="text" value={westernName} onChange={(e) => setWesternName(e.target.value)} style={styles.inputField} />
                <label style={{ fontSize: '12px', display: 'block', marginTop: '6px' }}>بلد المستلم:</label>
                <input type="text" value={westernCountry} onChange={(e) => setWesternCountry(e.target.value)} style={styles.inputField} />
              </div>
            </div>

            <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <strong style={{ color: '#2563eb', fontSize: '14px' }}>💳 بوابة باي بال (PayPal)</strong>
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '12px' }}>حساب البريد الإلكتروني للاستلام:</label>
                <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={styles.inputField} />
              </div>
            </div>
            <button onClick={() => alert("تم حفظ بيانات بوابات الدفع!")} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', width: '100%', marginTop: '12px', fontWeight: 'bold' }}>حفظ خيارات الدفع 💾</button>
          </div>
        )}

        {/* الإعدادات العامة */}
        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>إعدادات الموقع العامة</h2>
            <label style={{ fontSize: '13px' }}>اسم تطبيق الحراج الأصلي:</label>
            <input type="text" defaultValue="حراج السيارات الفعلي" style={styles.inputField} />
            <button onClick={() => alert("تم الحفظ.")} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', marginTop: '10px', fontWeight: 'bold', width: '100%' }}>حفظ الإعدادات</button>
          </div>
        )}

      </div>
    </div>
  );
}
