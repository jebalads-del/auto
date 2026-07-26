d('');
        setConfirmPassword('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch {
      setMessage('❌ حدث خطأ في الاتصال');
    }
  };

  const handleCommercialAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      if (!userId) {
        setMessage('❌ يرجى تسجيل الدخول أولاً');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/commercial-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId as string),
          position: commercialAd.position,
          image: commercialAd.image,
          link_url: commercialAd.link_url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ تم إرسال طلب الإعلان بنجاح');
        setCommercialAd({ position: 'header', image: '', link_url: '' });
        fetchUserCommercialAds();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch {
      setMessage('❌ حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={styles.loading}>جاري التحميل...</div>;

  return (
    <div style={styles.container}>
      {/* الهيدر */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>🚗 سيارتي</h1>
          <div style={styles.headerLinks}>
            <Link href="/" style={styles.headerLink}>الرئيسية</Link>
            <Link href="/dashboard/cars/new" style={styles.headerLink}>➕ نشر إعلان</Link>
            <button
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                localStorage.clear();
                window.location.href = '/login';
              }}
              style={styles.logoutBtn}
            >
              🚪 خروج
            </button>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
          <div style={styles.userInfo}>
            <div style={styles.nameRow}>
              <h2 style={styles.userName}>{user?.name || 'مستخدم'}</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} style={styles.editIconBtn}>
                  ✏️ تعديل
                </button>
              )}
            </div>
            <p style={styles.userEmail}>{user?.email}</p>
            <div style={styles.badge}>
              <span style={{
                ...styles.roleBadge,
                backgroundColor: user?.role === 'admin' ? '#fef3c7' : '#dbeafe',
                color: user?.role === 'admin' ? '#92400e' : '#1e40af',
              }}>
                {user?.role === 'admin' ? '🛡️ مدير' : '👤 مستخدم عادي'}
              </span>
              <span style={{
                ...styles.roleBadge,
                backgroundColor: user?.status === 'active' ? '#d1fae5' : '#fee2e2',
                color: user?.status === 'active' ? '#065f46' : '#991b1b',
              }}>
                {user?.status === 'active' ? '✅ مفعّل' : '⏳ غير مفعّل'}
              </span>
            </div>
          </div>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {/* نموذج التعديل */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            {isEditing ? '✏️ تعديل الملف الشخصي' : '📋 المعلومات الشخصية'}
          </h3>
          <div style={styles.card}>
            <div style={styles.field}>
              <label style={styles.label}>الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="الاسم الكامل"
                disabled={!isEditing}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>البريد الإلكتروني (غير قابل للتعديل)</label>
              <input
                type="email"
                value={user?.email || ''}
                style={{ ...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                disabled
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>📱 رقم الهاتف</label>
              <div style={styles.phoneContainer}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={styles.countrySelect}
                  disabled={!isEditing}
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="501234567"
            ding: '10px 20px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  subscriptionBadge: {
    display: 'inline-block',
    padding: '8px 24px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  subscriptionDate: {
    color: '#64748b',
    marginTop: '10px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '50px',
    color: '#64748b',
  },
  form: { // ✅ تمت الإضافة
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
};
