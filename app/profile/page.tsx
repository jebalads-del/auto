'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface Car {
  id?: number;
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  kilometers?: number;
  color?: string;
  description?: string;
  images?: any;
  status?: string;
  currency?: string;
  user_id?: string;
}

const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('0')) {
    cleaned = '965' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('965')) {
    cleaned = '965' + cleaned;
  }
  return cleaned;
};

export default function ProfilePage() {
  const router = useRouter();
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ id: '', name: '', email: '', phone: '' });
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState({ text: '', type: '' });
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ خطأ في جلب المستخدم:', userError);
          setLoading(false);
          return;
        }

        const userId = user.id;
        const userEmail = user.email || '';

        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('name, phone, email')
          .eq('id', userId);

        let userName = userEmail.split('@')[0] || 'مستخدم';
        let userPhone = '';
        let userEmailFromDB = userEmail;

        if (userData && userData.length > 0) {
          const userRecord = userData[0];
          userName = userRecord.name || userName;
          userPhone = userRecord.phone ? cleanPhoneNumber(userRecord.phone) : '';
          userEmailFromDB = userRecord.email || userEmail;
        } else {
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: userId,
                email: userEmail,
                name: userName,
                phone: '',
                role: 'user',
                status: 'active',
              }
            ]);

          if (insertError) {
            console.error('❌ خطأ في إضافة المستخدم:', insertError);
          }
        }

        setUserInfo({
          id: userId,
          name: userName,
          email: userEmailFromDB,
          phone: userPhone,
        });
        setNewName(userName);
        setNewPhone(userPhone);

        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmailFromDB);

        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (carsError) {
          console.error('❌ خطأ في جلب السيارات:', carsError);
        } else {
          setMyCars(carsData || []);
        }

      } catch (err) {
        console.error('❌ خطأ غير متوقع:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage({ text: '', type: '' });

    let userId = userInfo.id;
    if (!userId) {
      userId = localStorage.getItem('userId') || '';
    }

    if (!userId) {
      setUpdateMessage({ text: '❌ لم يتم العثور على معرف المستخدم', type: 'error' });
      return;
    }

    try {
      const cleanedPhone = cleanPhoneNumber(newPhone);
      
      const { error } = await supabase
        .from('users')
        .update({
          name: newName.trim(),
          phone: cleanedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        setUpdateMessage({ text: `❌ ${error.message}`, type: 'error' });
        return;
      }

      localStorage.setItem('userName', newName.trim());
      
      setUserInfo(prev => ({ 
        ...prev, 
        name: newName.trim(), 
        phone: cleanedPhone 
      }));
      setNewPhone(cleanedPhone);
      
      setUpdateMessage({ text: '✅ تم تحديث بياناتك الشخصية بنجاح!', type: 'success' });

    } catch (err: any) {
      setUpdateMessage({ text: `❌ ${err.message || 'حدث خطأ'}`, type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });

    if (!currentPassword || !newPassword) {
      setPasswordMessage({ text: '❌ الرجاء تعبئة كافة حقول كلمة السر', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ text: '❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل', type: 'error' });
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userInfo.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordMessage({ text: '❌ كلمة المرور الحالية غير صحيحة', type: 'error' });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordMessage({ text: `❌ ${updateError.message}`, type: 'error' });
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage({ text: '✅ تم تغيير كلمة السر بنجاح! 🔒', type: 'success' });

    } catch (err: any) {
      setPasswordMessage({ text: `❌ ${err.message || 'حدث خطأ'}`, type: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      router.push('/login');
    } catch (err) {
      console.error('❌ خطأ في تسجيل الخروج:', err);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: 'sans-serif', color: '#64748b', marginTop: '15px' }}>⏳ جاري تحميل الملف الشخصي...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ✅ هيدر صغير جداً */}
      <div style={styles.heroSection}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>👤 حسابي</h1>
            <button onClick={handleLogout} style={styles.logoutButton}>🚪 خروج</button>
          </div>
        </header>
        <div style={styles.heroBody}>
          <h2 style={styles.heroMainTitle}>{userInfo.name || 'مستخدم'}</h2>
          <p style={styles.heroSubTitle}>{userInfo.email || 'البريد الإلكتروني'}</p>
          {userInfo.phone && (
            <p style={styles.heroPhone}>📱 {userInfo.phone}</p>
          )}
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.actionButtonsGrid}>
          <Link href="/dashboard/cars/new" style={styles.actionButtonPost}>➕ نشر إعلان سيارة جديد</Link>
        </div>

        <div style={styles.settingsSection}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '15px' }}>⚙️ إعدادات الحساب</h3>
          
          {updateMessage.text && (
            <div style={{
              padding: '10px',
              backgroundColor: updateMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: updateMessage.type === 'success' ? '#065f46' : '#991b1b',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              {updateMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.labelField}>البريد الإلكتروني (لا يمكن تعديله) 🛡️</label>
              <input type="text" value={userInfo.email} disabled style={styles.disabledInput} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.labelField}>الاسم الكامل</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={styles.inputField} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={styles.labelField}>رقم الهاتف</label>
              <input 
                type="text" 
                value={newPhone} 
                onChange={(e) => setNewPhone(e.target.value)} 
                placeholder="أدخل رقم هاتفك (مثال: 96512345678)" 
                style={styles.inputField} 
              />
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                💡 سيتم تنسيق الرقم تلقائياً
              </p>
            </div>
            <button type="submit" style={styles.saveButton}>💾 حفظ التغييرات</button>
          </form>

          <hr style={{ border: '0', height: '1px', backgroundColor: '#e2e8f0', margin: '25px 0' }} />

          <form onSubmit={handleChangePassword}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '10px' }}>🔒 تغيير كلمة السر</h4>
            
            {passwordMessage.text && (
              <div style={{
                padding: '10px',
                backgroundColor: passwordMessage.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: passwordMessage.type === 'success' ? '#065f46' : '#991b1b',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                {passwordMessage.text}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <input type="password" placeholder="كلمة السر الحالية" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={styles.inputField} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="password" placeholder="كلمة السر الجديدة (6 أحرف على الأقل)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.inputField} required />
            </div>
            <button type="submit" style={styles.passwordButton}>🔑 تغيير كلمة السر</button>
          </form>
        </div>

        <h2 style={styles.sectionTitle}>🚗 إعلاناتي ({myCars.length})</h2>
        {myCars.length === 0 ? (
          <div style={styles.noCars}>📭 لم تقم بنشر أي سيارات حتى الآن</div>
        ) : (
          <div style={styles.grid}>
            {myCars.map((car) => (
              <div key={car.id} style={styles.card}>
                <div style={styles.cardBody}>
                  <h3 style={styles.carTitle}>{car.brand} {car.model}</h3>
                  <div style={styles.carPrice}>{car.price?.toLocaleString()} {car.currency === 'SAR' ? 'ر.س' : 'د.ك'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                    {car.status === 'approved' ? '✅ مقبول' : car.status === 'pending' ? '⏳ قيد المراجعة' : car.status}
                  </div>
                  <Link href={`/car/${car.id}`} style={styles.viewLink}>🔍 معاينة الإعلان</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  
  // ✅ هيدر صغير جداً
  heroSection: { 
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
    color: '#ffffff', 
    paddingBottom: '8px',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px' 
  },
  
  header: { 
    borderBottom: '1px solid rgba(255,255,255,0.08)', 
    padding: '6px 16px'
  },
  
  headerContent: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    maxWidth: '1200px', 
    margin: '0 auto' 
  },
  
  headerTitle: { 
    fontSize: '16px', 
    fontWeight: 'bold', 
    color: '#ffffff', 
    margin: 0 
  },
  
  logoutButton: { 
    padding: '4px 10px', 
    backgroundColor: '#ef4444', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '11px', 
    fontWeight: '600' 
  },
  
  heroBody: { 
    textAlign: 'center' as const, 
    padding: '10px 20px 4px 20px'
  },
  
  heroMainTitle: { 
    fontSize: '18px', 
    fontWeight: '800', 
    color: '#ffffff', 
    marginBottom: '2px' 
  },
  
  heroSubTitle: { 
    fontSize: '12px', 
    color: '#bfdbfe' 
  },
  
  heroPhone: { 
    fontSize: '12px', 
    color: '#93c5fd', 
    marginTop: '2px' 
  },
  
  content: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '16px' 
  },
  
  actionButtonsGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr', 
    gap: '12px', 
    marginBottom: '16px' 
  },
  
  actionButtonPost: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#10b981', 
    color: '#ffffff', 
    padding: '10px', 
    borderRadius: '12px', 
    fontSize: '14px', 
    fontWeight: 'bold', 
    textDecoration: 'none', 
    textAlign: 'center' as const 
  },
  
  settingsSection: { 
    backgroundColor: '#ffffff', 
    padding: '16px', 
    borderRadius: '14px', 
    border: '1px solid #e2e8f0', 
    marginBottom: '20px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
  },
  
  labelField: { 
    display: 'block', 
    fontSize: '12px', 
    fontWeight: '600', 
    color: '#475569', 
    marginBottom: '4px' 
  },
  
  inputField: { 
    width: '100%', 
    padding: '9px 12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    backgroundColor: '#f8fafc', 
    fontSize: '13px', 
    outline: 'none', 
    boxSizing: 'border-box' as const 
  },
  
  disabledInput: { 
    width: '100%', 
    padding: '9px 12px', 
    borderRadius: '8px', 
    border: '1px solid #e2e8f0', 
    backgroundColor: '#edf2f7', 
    color: '#718096', 
    fontSize: '13px', 
    cursor: 'not-allowed', 
    boxSizing: 'border-box' as const 
  },
  
  saveButton: { 
    width: '100%', 
    padding: '10px', 
    backgroundColor: '#2563eb', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontWeight: 'bold', 
    cursor: 'pointer' 
  },
  
  passwordButton: { 
    width: '100%', 
    padding: '10px', 
    backgroundColor: '#475569', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontWeight: 'bold', 
    cursor: 'pointer' 
  },
  
  sectionTitle: { 
    fontSize: '16px', 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: '12px' 
  },
  
  noCars: { 
    textAlign: 'center' as const, 
    padding: '24px 20px', 
    backgroundColor: '#ffffff', 
    borderRadius: '14px', 
    border: '1px solid #e2e8f0', 
    color: '#64748b' 
  },
  
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
    gap: '12px' 
  },
  
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: '14px', 
    border: '1px solid #e2e8f0', 
    overflow: 'hidden' 
  },
  
  cardBody: { 
    padding: '14px' 
  },
  
  carTitle: { 
    fontSize: '14px', 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: '4px', 
    marginTop: 0 
  },
  
  carPrice: { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#10b981', 
    marginBottom: '4px' 
  },
  
  viewLink: { 
    display: 'block', 
    textAlign: 'center' as const, 
    backgroundColor: '#f8fafc', 
    color: '#475569', 
    padding: '7px', 
    borderRadius: '8px', 
    fontSize: '12px', 
    fontWeight: '600', 
    textDecoration: 'none', 
    border: '1px solid #e2e8f0' 
  },
  
  loadingContainer: { 
    display: 'flex', 
    flexDirection: 'column' as const, 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#f8fafc' 
  },
  
  spinner: { 
    width: '40px', 
    height: '40px', 
    border: '4px solid #e2e8f0', 
    borderTop: '4px solid #3b82f6', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  }
};
