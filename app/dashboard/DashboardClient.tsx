  const styles = {
    container: { fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '12px', direction: 'rtl' as const },
    header: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', textAlign: 'center' as const, marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    tabGrid: { display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '20px' },
    tabButton: (isActive: boolean) => ({
      width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 'bold' as const, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: isActive ? '#2563eb' : '#ffffff', color: isActive ? '#ffffff' : '#4b5563', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s'
    }),
    badge: (isActive: boolean) => ({
      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: isActive ? '#ffffff' : '#1e293b', padding: '2px 8px', borderRadius: '20px', fontSize: '11px'
    }),
    card: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    tableWrapper: { overflowX: 'auto' as const, borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'right' as const, fontSize: '13px' },
    th: { backgroundColor: '#f8fafc', color: '#64748b', padding: '10px', borderBottom: '2px solid #edf2f7' },
    td: { padding: '10px', borderBottom: '1px solid #f1f5f9' },
    btnAction: { padding: '6px 10px', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: 'bold' as const, cursor: 'pointer', marginLeft: '4px' },
    inputField: { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', marginTop: '4px', outline: 'none', boxSizing: 'border-box' as const }
  };
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ color: '#1e3a8a', fontSize: '20px', margin: '0 0 4px 0', fontWeight: 'bold' }}>📊 لوحة تحكم المدير</h1>
        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>نظام إدارة العمليات الحية الفوري</p>
      </header>

      {/* قائمة أزرار عمودية آمنة تمنع التداخل نهائياً على شاشة الهاتف */}
      <div style={styles.tabGrid}>
        <button onClick={() => setActiveTab('users')} style={styles.tabButton(activeTab === 'users')}>
          <span>👥 إدارة المستخدمين</span> <span style={styles.badge(activeTab === 'users')}>{usersList.length}</span>
        </button>
        <button onClick={() => setActiveTab('ads')} style={styles.tabButton(activeTab === 'ads')}>
          <span>🚗 إعلانات السيارات</span> <span style={styles.badge(activeTab === 'ads')}>{carsList.length}</span>
        </button>
        <button onClick={() => setActiveTab('payments')} style={styles.tabButton(activeTab === 'payments')}>
          <span>💳 خيارات الدفع والعملات</span> <span style={styles.badge(activeTab === 'payments')}>★</span>
        </button>
        <button onClick={() => setActiveTab('settings')} style={styles.tabButton(activeTab === 'settings')}>
          <span>⚙️ إعدادات الموقع العامة</span> <span>⚙️</span>
        </button>
      </div>

      <div style={styles.card}>
        {/* شاشة إدارة المستخدمين حياً */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>جدول المستخدمين ({usersList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>المستعمل</th>
                    <th style={styles.th}>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user, index) => (
                    <tr key={user.id || index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600' }}>{user.name || user.username || "مستخدم حراج"}</div>
                        <div style={{ color: '#64748b', fontSize: '11px' }}>{user.email}</div>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleToggleUserStatus(user.id, user.status)} style={{ ...styles.btnAction, backgroundColor: user.status === 'موقوف' ? '#10b981' : '#f59e0b' }}>
                          {user.status === 'موقوف' ? "تفعيل" : "إيقاف"}
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} style={{ ...styles.btnAction, backgroundColor: '#ef4444' }}>حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* شاشة تحسينات إعلانات السيارات الحية */}
        {activeTab === 'ads' && (
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>إعلانات السيارات الفعالة ({carsList.length})</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>السيارة والسعر</th>
                    <th style={styles.th}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {carsList.map((car, index) => (
                    <tr key={car.id || index}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600' }}>{car.brand || car.title} {car.model}</div>
                        <div style={{ color: '#10b981', fontWeight: 'bold' }}>{car.price} {car.currency || "KWD"}</div>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleMarkAsSold(car.id)} style={{ ...styles.btnAction, backgroundColor: '#10b981' }}>مُباعة</button>
                        <button onClick={() => handleDeleteCar(car.id)} style={{ ...styles.btnAction, backgroundColor: '#ef4444' }}>حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* 3. خيارات الدفع والعملات الخليجية المدمجة والمصححة */}
        {activeTab === 'payments' && (
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a8a' }}>💱 تخصيص العملات الخليجية للموقع</h2>
            
            <div style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', marginBottom: '16px', backgroundColor: '#f8fafc' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>العملة الافتراضية للموقع الأساسي:</label>
              <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="KWD">🇰🇼 دينار كويتي (الافتراضية)</option>
                <option value="SAR">🇸🇦 ريال سعودي</option>
                <option value="AED">🇦🇪 درهم إماراتي</option>
              </select>
              
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>العملات المتاحة للمعلنين الخليجيين:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {Object.keys(allowedCurrencies).map((code) => (
                    <label key={code} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: '#fff', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <input type="checkbox" checked={allowedCurrencies[code as keyof typeof allowedCurrencies]} onChange={() => handleToggleCurrency(code)} />
                      {code} {code === defaultCurrency && "(الرئيسية)"}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>💳 بوابات الدفع وحساب المستلم</h2>
            {/* بوابة ويسترن يونيون */}
            <div style={{ padding: '12px', border: isWesternActive ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '13px' }}>📌 بوابة ويسترن يونيون</strong>
                <input type="checkbox" checked={isWesternActive} onChange={() => setIsWesternActive(!isWesternActive)} />
              </div>
              <div style={{ opacity: isWesternActive ? 1 : 0.4 }}>
                <input type="text" placeholder="اسم المستلم" disabled={!isWesternActive} value={westernName} onChange={(e) => setWesternName(e.target.value)} style={styles.inputField} />
                <input type="text" placeholder="البلد" disabled={!isWesternActive} value={westernCountry} onChange={(e) => setWesternCountry(e.target.value)} style={styles.inputField} />
              </div>
            </div>

            {/* بوابة باي بال */}
            <div style={{ padding: '12px', border: isPaypalActive ? '2px solid #10b981' : '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '13px' }}>💳 بوابة باي بال (PayPal)</strong>
                <input type="checkbox" checked={isPaypalActive} onChange={() => setIsPaypalActive(!isPaypalActive)} />
              </div>
              <div style={{ opacity: isPaypalActive ? 1 : 0.4 }}>
                <input type="email" placeholder="البريد الإلكتروني لباي بال" disabled={!isPaypalActive} value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} style={styles.inputField} />
              </div>
            </div>

            <button onClick={() => alert("تم حفظ العملات وإعدادات الدفع بنجاح!")} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', width: '100%', marginTop: '12px', fontWeight: 'bold' }}>حفظ التعديلات الحية 💾</button>
          </div>
        )}

        {/* 4. الإعدادات العامة */}
        {activeTab === 'settings' && (
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>إعدادات الموقع العامة</h2>
            <label style={{ fontSize: '12px' }}>اسم تطبيق الحراج الأصلي:</label>
            <input type="text" defaultValue="حراج السيارات الخليجي الفعلي" style={styles.inputField} />
            <button onClick={() => alert("تم حفظ الإعدادات.")} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', marginTop: '10px', fontWeight: 'bold', width: '100%' }}>حفظ</button>
          </div>
        )}
      </div>
    </div>
  );
}

