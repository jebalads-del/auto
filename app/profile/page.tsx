'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Car {
  id?: number; ID?: number; brand?: string; BRAND?: string;
  model?: string; MODEL?: string; year?: number; YEAR?: number;
  price?: number; PRICE?: number; kilometers?: number; KILOMETERS?: number;
  color?: string; COLOR?: string; description?: string; DESCRIPTION?: string;
  images?: any; IMAGES?: any; status?: string; STATUS?: string; currency?: string; CURRENCY?: string;
  user_email?: string; USER_EMAIL?: string; // إضافة حقل البريد التابع للإعلان
}

export default function ProfilePage() {
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [userInfo, setUserInfo] = useState({ name: 'مستعمل حراج', email: 'user@example.com', phone: '' });
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [carsRes, userRes] = await Promise.all([
          fetch('/api/cars', { cache: 'no-store' }),
          fetch('/api/user', { cache: 'no-store' })
        ]);
        const carsData = await carsRes.json();
        const userData = await userRes.json();
        
        if (userData && userData.success && userData.user) {
          setUserInfo(userData.user);
          setNewName(userData.user.name || '');
          setNewPhone(userData.user.phone || '');
          
          // فلترة السيارات لتعرض فقط السيارات التي تطابق إيميل المستخدم الحالي المسجل
          if (carsData && carsData.success && Array.isArray(carsData.cars)) {
            const userEmail = userData.user.email || '';
            const filtered = carsData.cars.filter((car: any) => {
              const carEmail = car.user_email || car.USER_EMAIL || car.email || car.EMAIL || '';
              return carEmail.toLowerCase() === userEmail.toLowerCase();
            });
            setMyCars(filtered);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, phone: newPhone })
      });
      if (res.ok) {
        alert('تم تحديث البيانات الشخصية بنجاح! ✅');
        setUserInfo(prev => ({ ...prev, name: newName, phone: newPhone }));
      }
    } catch {
      alert('خطأ في تحديث البيانات');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return alert('الرجاء تعبئة كافة حقول كلمة السر');
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.ok) {
        alert('تم تغيير كلمة السر بنجاح! 🔒');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        alert('فشل تغيير كلمة السر، تأكد من الكلمة الحالية');
      }
    } catch {
      alert('خطأ في الاتصال بالسيرفر');
    }
  };

  const validCars = Array.isArray(myCars) ? myCars : [];
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b', marginTop: '15px' }}>جاري تحميل ملفك الشخصي...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* الهيدر الشخصي والواجهة الزرقاء */}
      <div style={styles.heroSection}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>👤 حسابي الشخصي</h1>
            <Link href="/" style={styles.headerLink}>🏠 العودة للرئيسية</Link>
          </div>
        </header>
        <div style={styles.heroBody}>
          <h2 style={styles.heroMainTitle}>{userInfo.name}</h2>
          <p style={styles.heroSubTitle}>{userInfo.email}</p>
        </div>
      </div>

      <div style={styles.content}>
        {/* زر نشر إعلان سيارة جديد الثابت */}
        <div style={styles.actionButtonsGrid}>
          <Link href="/dashboard/cars/new" style={styles.actionButtonPost}>➕ نشر إعلان سيارة جديد</Link>
        </div>

        {/* قسم تعديل الحساب والبيانات مع حماية الإيميل */}
        <div style={styles.settingsSection}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>⚙️ إعدادات الحساب والأمان</h3>
          
          <form onSubmit={handleUpdateProfile} style={{ marginBottom: '25px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.labelField}>البريد الإلكتروني (محمي لا يمكن تعديله) 🛡️</label>
              <input type="text" value={userInfo.email} disabled style={styles.disabledInput} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.labelField}>الاسم الكامل</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={styles.inputField} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={styles.labelField}>رقم الهاتف</label>
              <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="أدخل رقم هاتفك هنا" style={styles.inputField} />
            </div>
            <button type="submit" style={styles.saveButton}>حفظ التغييرات الشخصية</button>
          </form>

          <hr style={{ border: '0', height: '1px', backgroundColor: '#e2e8f0', margin: '20px 0' }} />

          <form onSubmit={handleChangePassword}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>🔒 تغيير كلمة السر</h4>
            <div style={{ marginBottom: '12px' }}>
              <input type="password" placeholder="كلمة السر الحالية" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={styles.inputField} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="password" placeholder="كلمة السر الجديدة" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.inputField} />
            </div>
            <button type="submit" style={styles.passwordButton}>تحديث كلمة السر بأمان</button>
          </form>
        </div>

        <h2 style={styles.sectionTitle}>🚗 إعلاناتي الحالية ({validCars.length})</h2>
        {validCars.length === 0 ? (
          <div style={styles.noCars}>لم تقم بنشر أي سيارات حتى الآن 🔍</div>
        ) : (
          <div style={styles.grid}>
            {validCars.map((car) => {
              if (!car) return null;
              const carId = car.id || car.ID;
              const carBrand = car.brand || car.BRAND || '';
              const carModel = car.model || car.MODEL || '';
              const carPrice = car.price || car.PRICE || 0;
              const carCurrency = car.currency || car.CURRENCY || '';
              return (
                <div key={carId} style={styles.card}>
                  <div style={styles.cardBody}>
                    <h3 style={styles.carTitle}>{carBrand} {carModel}</h3>
                    <div style={styles.carPrice}>{carPrice.toLocaleString()} {carCurrency === 'SAR' ? 'ر.س' : 'د.ك'}</div>
                    <Link href={`/car/${carId}`} style={styles.viewLink}>معاينة الإعلان ←</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  heroSection: { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#ffffff', paddingBottom: '30px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' },
  header: { borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '15px 20px' },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' },
  headerTitle: { fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 },
  headerLink: { fontSize: '14px', color: '#cbd5e1', textDecoration: 'none' },
  heroBody: { textAlign: 'center' as const, padding: '40px 20px 10px 20px' },
  heroMainTitle: { fontSize: '26px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' },
  heroSubTitle: { fontSize: '14px', color: '#bfdbfe' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '25px 20px' },
  actionButtonsGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '25px' },
  actionButtonPost: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', color: '#ffffff', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const },
  settingsSection: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  labelField: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' },
  inputField: { width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const },
  disabledInput: { width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#edf2f7', color: '#718096', fontSize: '14px', cursor: 'not-allowed', boxSizing: 'border-box' as const },
  saveButton: { width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  passwordButton: { width: '100%', padding: '12px', backgroundColor: '#475569', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' },
  noCars: { textAlign: 'center' as const, padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  cardBody: { padding: '20px' },
  carTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', marginTop: 0 },
  carPrice: { fontSize: '18px', fontWeight: '800', color: '#10b981', marginBottom: '12px' },
  viewLink: { display: 'block', textAlign: 'center' as const, backgroundColor: '#f8fafc', color: '#475569', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', border: '1px solid #e2e8f0' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%' }
};
