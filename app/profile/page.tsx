'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

// قائمة الدول مع رموز الاتصال
const countries = [
  { code: '+966', name: '🇸🇦 السعودية' },
  { code: '+971', name: '🇦🇪 الإمارات' },
  { code: '+974', name: '🇶🇦 قطر' },
  { code: '+965', name: '🇰🇼 الكويت' },
  { code: '+968', name: '🇴🇲 عُمان' },
  { code: '+973', name: '🇧🇭 البحرين' },
  { code: '+962', name: '🇯🇴 الأردن' },
  { code: '+961', name: '🇱🇧 لبنان' },
  { code: '+963', name: '🇸🇾 سوريا' },
  { code: '+970', name: '🇵🇸 فلسطين' },
  { code: '+20', name: '🇪🇬 مصر' },
  { code: '+212', name: '🇲🇦 المغرب' },
  { code: '+216', name: '🇹🇳 تونس' },
  { code: '+213', name: '🇩🇿 الجزائر' },
  { code: '+218', name: '🇱🇾 ليبيا' },
  { code: '+249', name: '🇸🇩 السودان' },
  { code: '+90', name: '🇹🇷 تركيا' },
  { code: '+1', name: '🇺🇸 الولايات المتحدة' },
  { code: '+44', name: '🇬🇧 المملكة المتحدة' },
  { code: '+91', name: '🇮🇳 الهند' },
  { code: '+92', name: '🇵🇰 باكستان' },
];

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  phone: string;
  created_at: string;
}

interface CommercialAd {
  id: number;
  position: string;
  status: string;
  price: number;
  duration_days: number;
  image_url: string;
  link_url: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+966');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // تغيير كلمة السر
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ إعلانات تجارية
  const [commercialAd, setCommercialAd] = useState({
    position: 'header',
    image: '',
    link_url: '',
  });
  const [userCommercialAds, setUserCommercialAds] = useState<CommercialAd[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchUserCommercialAds();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setName(data.user.name || '');

        const phoneNumber = data.user.phone || '';
        let displayPhone = phoneNumber;
        let displayCode = '+966';
        for (const country of countries) {
          if (phoneNumber.startsWith(country.code)) {
            displayCode = country.code;
            displayPhone = phoneNumber.substring(country.code.length);
            break;
          }
        }
        setCountryCode(displayCode);
        setPhone(displayPhone);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCommercialAds = async () => {
    try {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      if (!userId) return;

      const res = await fetch(`/api/user/commercial-ads?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setUserCommercialAds(data.ads);
      }
    } catch (error) {
      console.error('خطأ في جلب إعلانات المستخدم:', error);
    }
  };

  const handleUpdate = async () => {
    setMessage('');
    try {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      const fullPhone = countryCode + phone.replace(/^0+/, '');

      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, phone: fullPhone }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('✅ تم تحديث الملف الشخصي بنجاح');
        setIsEditing(false);
        fetchUserData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch {
      setMessage('❌ حدث خطأ في الاتصال');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('❌ كلمتا المرور غير متطابقتين');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      const userId = Cookies.get('userId') || localStorage.getItem('userId');
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('✅ تم تغيير كلمة المرور بنجاح');
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
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
      const res = await fetch('/api/commercial-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
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
                  disabled={!isEditing}
                />
              </div>
              <small style={styles.helperText}>📌 سيظهر رقم الهاتف في إعلاناتك للتواصل عبر واتساب</small>
            </div>

            {isEditing ? (
              <div style={styles.buttonGroup}>
                <button onClick={handleUpdate} style={styles.saveBtn}>💾 حفظ</button>
                <button onClick={() => { setIsEditing(false); setName(user?.name || ''); setPhone(user?.phone || ''); }} style={styles.cancelBtn}>❌ إلغاء</button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} style={styles.editBtn}>✏️ تعديل الملف الشخصي</button>
            )}
          </div>
        </div>

        {/* تغيير كلمة السر */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔑 تغيير كلمة السر</h3>
          <div style={styles.card}>
            {!showPasswordForm ? (
              <button onClick={() => setShowPasswordForm(true)} style={styles.editBtn}>
                🔑 تغيير كلمة السر
              </button>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div style={styles.field}>
                  <label style={styles.label}>كلمة المرور الحالية</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={styles.input}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div style={styles.buttonGroup}>
                  <button type="submit" style={styles.saveBtn}>💾 تغيير</button>
                  <button type="button" onClick={() => setShowPasswordForm(false)} style={styles.cancelBtn}>❌ إلغاء</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ✅ طلب إعلان تجاري */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📢 طلب إعلان تجاري</h3>
          <div style={styles.card}>
            <form onSubmit={handleCommercialAdSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>موقع الإعلان</label>
                <select
                  value={commercialAd.position}
                  onChange={(e) => setCommercialAd({ ...commercialAd, position: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="header">📌 الهيدر (أعلى الصفحة)</option>
                  <option value="footer">📌 الفوتر (أسفل الصفحة)</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>رابط الإعلان (اختياري)</label>
                <input
                  type="url"
                  value={commercialAd.link_url}
                  onChange={(e) => setCommercialAd({ ...commercialAd, link_url: e.target.value })}
                  style={styles.input}
                  placeholder="https://example.com"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>صورة الإعلان</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setCommercialAd({ ...commercialAd, image: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={styles.input}
                  required
                />
                {commercialAd.image && (
                  <img src={commercialAd.image} alt="صورة الإعلان" style={{ width: '100px', height: 'auto', marginTop: '10px', borderRadius: '8px' }} />
                )}
              </div>
              <button type="submit" disabled={submitting} style={styles.submitBtn}>
                {submitting ? 'جاري الإرسال...' : '📤 إرسال طلب الإعلان'}
              </button>
            </form>
          </div>
        </div>

        {/* ✅ إعلاناتي التجارية */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 إعلاناتي التجارية</h3>
          <div style={styles.card}>
            {userCommercialAds.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '10px' }}>
                لا توجد إعلانات تجارية حتى الآن
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {userCommercialAds.map((ad) => (
                  <div key={ad.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {ad.position === 'header' ? '📌 الهيدر' : '📌 الفوتر'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        السعر: ${ad.price} | المدة: {ad.duration_days} يوم
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: ad.status === 'pending' ? '#fef3c7' : ad.status === 'approved' ? '#d1fae5' : '#fee2e2',
                      color: ad.status === 'pending' ? '#92400e' : ad.status === 'approved' ? '#065f46' : '#991b1b',
                    }}>
                      {ad.status === 'pending' ? '⏳ قيد المراجعة' : ad.status === 'approved' ? '✅ مقبول' : '❌ مرفوض'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* نوع الاشتراك */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📦 نوع الاشتراك</h3>
          <div style={styles.card}>
            <div style={styles.subscriptionBadge}>
              {user?.role === 'admin' ? '👑 اشتراك إداري' : '📋 اشتراك مجاني'}
            </div>
            <p style={styles.subscriptionDate}>
              تاريخ التسجيل: {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : 'غير معروف'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'sans-serif',
    direction: 'rtl' as const,
  },
  header: {
    backgroundColor: '#1e293b',
    padding: '12px 20px',
    color: 'white',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  headerTitle: {
    color: '#38bdf8',
    margin: 0,
    fontSize: '18px',
  },
  headerLinks: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  headerLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '14px',
  },
  logoutBtn: {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '25px',
    flexWrap: 'wrap' as const,
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  userName: {
    fontSize: '22px',
    margin: 0,
    color: '#1e293b',
  },
  editIconBtn: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  userEmail: {
    color: '#64748b',
    margin: '5px 0 10px',
  },
  badge: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  message: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#1e293b',
    marginBottom: '15px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  field: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#1e293b',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
  },
  phoneContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
    flexDirection: 'row-reverse' as const,
    alignItems: 'center',
  },
  countrySelect: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    minWidth: '140px',
  },
  helperText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '5px',
    display: 'block',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
    marginTop: '10px',
  },
  editBtn: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 20px',
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
};
