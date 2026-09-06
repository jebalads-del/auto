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
  is_featured?: boolean;
  featured_status?: string | null;

}

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
        console.log('🔍 بدء تحميل بيانات المستخدم...');
        
        // 1. جلب المستخدم الحالي من Supabase Auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ خطأ في جلب المستخدم:', userError);
          setLoading(false);
          return;
        }

        const userId = user.id;
        const userEmail = user.email || '';

        console.log('✅ userId من Auth:', userId);
        console.log('✅ userEmail من Auth:', userEmail);

        // 2. جلب بيانات المستخدم من جدول users
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('name, phone, email')
          .eq('id', userId);

        console.log('📦 userData من قاعدة البيانات:', userData);
        console.log('❌ dbError:', dbError);

        // 3. معالجة البيانات
        let userName = userEmail.split('@')[0] || 'مستخدم';
        let userPhone = '';
        let userEmailFromDB = userEmail;

        if (userData && userData.length > 0) {
          // إذا وجدت بيانات في جدول users
          const userRecord = userData[0];
          userName = userRecord.name || userName;
          userPhone = userRecord.phone || '';
          userEmailFromDB = userRecord.email || userEmail;
          console.log('✅ تم جلب البيانات من جدول users');
        } else {
          console.log('⚠️ لا توجد بيانات في جدول users، سيتم إضافة المستخدم');
          
          // إذا لم يكن المستخدم في جدول users، أضفه
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
          } else {
            console.log('✅ تم إضافة المستخدم إلى جدول users');
          }
        }

        // 4. تحديث State
        setUserInfo({
          id: userId,
          name: userName,
          email: userEmailFromDB,
          phone: userPhone,
        });
        setNewName(userName);
        setNewPhone(userPhone);

        // 5. تحديث localStorage
        localStorage.setItem('userId', userId);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmailFromDB);

        console.log('✅ تم تعيين البيانات:', { name: userName, phone: userPhone, email: userEmailFromDB });

        // 6. جلب سيارات المستخدم
        const { data: carsData, error: carsError } = await supabase
          .from('cars')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (carsError) {
          console.error('❌ خطأ في جلب السيارات:', carsError);
        } else {
          setMyCars(carsData || []);
          console.log('✅ تم جلب السيارات:', carsData?.length || 0);
        }

      } catch (err) {
        console.error('❌ خطأ غير متوقع:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [supabase]);

  // تحديث الملف الشخصي
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
      const { error } = await supabase
        .from('users')
        .update({
          name: newName.trim(),
          phone: newPhone.trim(),
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
        phone: newPhone.trim() 
      }));
      
      setUpdateMessage({ text: '✅ تم تحديث بياناتك الشخصية بنجاح!', type: 'success' });

    } catch (err: any) {
      setUpdateMessage({ text: `❌ ${err.message || 'حدث خطأ'}`, type: 'error' });
    }
  };

  // تغيير كلمة المرور
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

  // تسجيل الخروج
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
      <div style={styles.heroSection}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>👤 حسابي الشخصي</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link href="/" style={styles.headerLink}>🏠 العودة للرئيسية</Link>
              <button onClick={handleLogout} style={styles.logoutButton}>🚪 خروج</button>
            </div>
          </div>
        </header>
        <div style={styles.heroBody}>
          <h2 style={styles.heroMainTitle}>{userInfo.name || 'مستخدم'}</h2>
          <p style={styles.heroSubTitle}>{userInfo.email || 'البريد الإلكتروني'}</p>
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
              <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="أدخل رقم هاتفك" style={styles.inputField} />
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
                           {/* زر الترقية الذهبي المدفوع والمربوط بالمنبثقة والسيرفر */}
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {car.is_featured ? (
              <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #f59e0b' }}>🌟 مميز نشط لايف</span>
            ) : car.featured_status === 'pending' ? (
              <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '6px', borderRadius: '6px', fontSize: '11px', textAlign: 'center' }}>⏳ قيد المراجعة الماليّة</span>
            ) : (
              <button 
                type="button"
                disabled={featureLoading === car.id}
                onClick={() => { setSelectedCarId(car.id ?? null); setShowPaymentModal(true); }}
                style={{ width: '100%', padding: '6px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
              >
                ⭐ طلب ترقية لمميز
              </button>
            )}
          </div>


                  <Link href={`/car/${car.id}`} style={styles.viewLink}>🔍 معاينة الإعلان</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 1000, color: '#000' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>⭐ ترقية الإعلان إلى مميز</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>تمنحك الترقية ظهور سيارتك في أعلى نتائج البحث بالصفحة الرئيسية دائماً لزيادة سرعة البيع.</p>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>💰 طرق تحويل الرسوم المتاحة:</p>
              <p style={{ margin: '3px 0' }}>• <b>Western Union:</b> الاسم الكامل: مدير الموقع - الدولة: الكويت</p>
              <p style={{ margin: '3px 0' }}>• <b>PayPal:</b> admin@sayarty.store</p>
              <p style={{ margin: '8px 0 0 0', color: '#2563eb', fontWeight: 'bold' }}>* يرجى تحويل الرسوم المقررة ثم الضغط على زر التأكيد أدناه.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowPaymentModal(false); setSelectedCarId(null); }} style={{ padding: '8px 14px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>إلغاء</button>
              <button onClick={handleRequestFeature} style={{ padding: '8px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>✅ تم الدفع، إرسال الطلب</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

  // ======= نظام التميز والدفع المطور لصفحة الملف الشخصي =======
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [featureLoading, setFeatureLoading] = useState<number | null>(null);

  const handleRequestFeature = async () => {
    if (!selectedCarId) return;
    try {
      setFeatureLoading(selectedCarId);
      setShowPaymentModal(false);
      const res = await fetch(`/api/car/${selectedCarId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured_status: 'pending' })
      });
      if (res.ok) {
        alert('⭐ تم إرسال طلب التمييز بنجاح! سيقوم المشرف بتفعيله فور التأكد من الدفع.');
        setMyCars(prev => prev.map(c => c.id === selectedCarId ? { ...c, featured_status: 'pending' } : c));
      } else {
        alert('❌ فشل إرسال الطلب');
      }
    } catch {
      alert('❌ خطأ في الاتصال بالخادم');
    } finally {
      setFeatureLoading(null);
      setSelectedCarId(null);
    }
  };


const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  heroSection: { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: '#ffffff', paddingBottom: '30px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' },
  header: { borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '15px 20px' },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' },
  headerTitle: { fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 },
  headerLink: { fontSize: '14px', color: '#cbd5e1', textDecoration: 'none' },
  logoutButton: { padding: '6px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
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
  carPrice: { fontSize: '18px', fontWeight: '800', color: '#10b981', marginBottom: '8px' },
  viewLink: { display: 'block', textAlign: 'center' as const, backgroundColor: '#f8fafc', color: '#475569', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', border: '1px solid #e2e8f0' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
