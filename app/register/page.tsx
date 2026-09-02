'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface Car {
  id?: number; ID?: number; brand?: string; BRAND?: string;
  model?: string; MODEL?: string; year?: number; YEAR?: number;
  price?: number; PRICE?: number; kilometers?: number; KILOMETERS?: number;
  color?: string; COLOR?: string; description?: string; DESCRIPTION?: string;
  images?: any; IMAGES?: any; status?: string; STATUS?: string; currency?: string; CURRENCY?: string;
  user_email?: string; USER_EMAIL?: string;
}

export default function ProfilePage() {
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // تهيئة الحقول لتستقبل البيانات الحقيقية من المتصفح مباشرة
  const [userInfo, setUserInfo] = useState({ id: '', name: 'مستعمل سيارتي', email: '', phone: '' });
  const [newName, setNewName] = useState('مستعمل سيارتي');
  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // إنشاء اتصال Supabase مدمج ومباشر لحل المشكلة فوراً وعبر الواجهة
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const loadLocalUserData = async () => {
      try {
        // قراءة المتغيرات المحلية المخزنة
        const savedId = localStorage.getItem('userId') || '';
        const savedName = localStorage.getItem('userName') || 'مستعمل سيارتي';
        let savedEmail = localStorage.getItem('userEmail') || '';
        let dbPhone = '';

        // الحل السحري الصارم: جلب الإيميل الحقيقي والآمن مباشرة من جلسة Supabase لكسر التعليق
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          savedEmail = user.email;
          localStorage.setItem('userEmail', savedEmail);
        }

        // جلب الهاتف من قاعدة البيانات المحلية الخاصة بك باستخدام المعرف الرقمي
        if (savedId) {
          const userRes = await fetch(`/api/user/${savedId}`, { cache: 'no-store' });
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData && userData.success && userData.user) {
              dbPhone = userData.user.phone || '';
              // حماية إضافية في حال عدم توفر الإيميل في الجلسة نأخذه من الـ API
              if (!savedEmail && userData.user.email) {
                savedEmail = userData.user.email;
                localStorage.setItem('userEmail', savedEmail);
              }
            }
          }
        }

        // حقن وتثبيت البيانات الحقيقية 100% داخل حقول الواجهة والشريط الأزرق العلوي
        setUserInfo({ id: savedId, name: savedName, email: savedEmail, phone: dbPhone });
        setNewName(savedName);
        setNewPhone(dbPhone);

        // جلب السيارات وتصفيتها بناءً على بريدك الإلكتروني
        if (savedEmail) {
          const carsRes = await fetch('/api/cars', { cache: 'no-store' });
          if (carsRes.ok) {
            const carsData = await carsRes.json();
            if (carsData && carsData.success && Array.isArray(carsData.cars)) {
              const filtered = carsData.cars.filter((car: any) => {
                const carEmail = car.user_email || car.USER_EMAIL || car.email || car.EMAIL || '';
                return carEmail.toLowerCase() === savedEmail.trim().toLowerCase();
              });
              setMyCars(filtered);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadLocalUserData();
    return () => clearTimeout(safetyTimer);
  }, []);

  // دالة تسجيل الخروج المضافة حديثاً
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // تسجيل الخروج من سوبابيس
      localStorage.clear(); // تنظيف المتصفح من أي بيانات مخزنة
      router.push('/'); // التوجيه للرئيسية
      router.refresh();
    } catch {
      alert('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || userInfo.id || localStorage.getItem('userId');

      if (!currentUserId) {
        alert('خطأ: لم يتم العثور على معرف المستخدم الرقمي، الرجاء إعادة تسجيل الدخول لتحديث البيانات');
        return;
      }

      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: currentUserId, 
          name: newName, 
          phone: newPhone 
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        alert('تم تحديث بياناتك الشخصية بنجاح واكتمل الحفظ! ✅');
        localStorage.setItem('userName', newName);
        setUserInfo(prev => ({ ...prev, name: newName, phone: newPhone }));
      } else {
        alert(data.message || 'خطأ في تحديث المستخدم ❌');
      }
    } catch {
      alert('خطأ في شبكة الاتصال أثناء التحديث');
    }
  };
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return alert('الرجاء تعبئة كافة حقول كلمة السر');
    
    try {
      const { error: passError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passError) {
        alert(`فشل تغيير كلمة السر: ${passError.message} ❌`);
        return;
      }

      await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      alert('تم تغيير كلمة السر بنجاح! 🔒');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      alert('خطأ في الاتصال بالسيرفر أثناء تحديث كلمة السر');
    }
  };

  const validCars = Array.isArray(myCars) ? myCars : [];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b', marginTop: '15px' }}>جاري فتح ملفك الشخصي بأمان...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>👤 حسابي الشخصي</h1>
            <Link href="/" style={styles.headerLink}>🏠 العودة للرئيسية</Link>
          </div>
        </header>
        <div style={styles.heroBody}>
          <h2 style={styles.heroMainTitle}>{userInfo.name}</h2>
          <p style={styles.heroSubTitle}>{userInfo.email || 'جاري تحميل البريد الإلكتروني...'}</p>
          
          {/* زر تسجيل الخروج المضاف بشكل أنيق وجذاب تحت الإيميل */}
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 تسجيل الخروج من الموقع
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.actionButtonsGrid}>
          <Link href="/dashboard/cars/new" style={styles.actionButtonPost}>➕ نشر إعلان سيارة جديد</Link>
        </div>

        <div style={styles.settingsSection}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>⚙️ إعدادات الحساب والأمان</h3>
          
          <form onSubmit={handleUpdateProfile} style={{ marginBottom: '25px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.labelField}>البريد الإلكتروني (محمي لا يمكن تعديله) 🛡️</label>
              <input type="text" value={userInfo.email} disabled style={styles.disabledInput} placeholder="جاري جلب البريد الإلكتروني المحمي..." />
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
  heroBody: { textAlign: 'center' as const, padding: '30px 20px 10px 20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  heroMainTitle: { fontSize: '26px', fontWeight: '800', color: '#ffffff', marginBottom: '8px', marginTop: 0 },
  heroSubTitle: { fontSize: '14px', color: '#bfdbfe', marginBottom: '15px', marginTop: 0 },
  logoutButton: { backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'background 0.2s' },
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
