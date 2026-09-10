'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface Car {
  id: string; brand: string; model: string; price: number;
  year?: number; currency?: string; status: string; images?: string[];
  is_featured?: boolean; featured_payment_ref?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // إعدادات الدفع الديناميكية الواردة من جدول site_settings
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [livePrice, setLivePrice] = useState('15');
  const [liveWestern, setLiveWestern] = useState('الاسم الكامل: مدير الموقع - الكويت');
  const [livePaypal, setLivePaypal] = useState('admin@sayarty.store');

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };
  const fetchProfileCarsAndSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setEmail(user.email || '');

      // 1. جلب الإعدادات المالية الحية من السيرفر
      const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
      if (settings) {
        setLivePrice(settings.featured_price?.toString() || '15');
        setLiveWestern(settings.western_union_info || '');
        setLivePaypal(settings.paypal_email || '');
      }

      // 2. جلب بيانات الحساب الشخصية
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (profile) { setName(profile.name || ''); setPhone(profile.phone || ''); }

      // 3. جلب إعلانات المستخدم
      const { data: carData } = await supabase.from('cars').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (carData) setMyCars(carData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfileCarsAndSettings(); }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('users').update({ name: name.trim(), phone: phone.trim() }).eq('id', user.id);
      if (!error) showMessage('⚙️ تم حفظ تغييرات الحساب بنجاح', 'success');
      else showMessage('❌ حدث خطأ أثناء التحديث', 'error');
    } catch { showMessage('❌ خطأ في الاتصال بالسيرفر', 'error'); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { showMessage('❌ يجب أن تكون كلمة السر الجديدة 6 أحرف على الأقل', 'error'); return; }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) { showMessage('🔑 تم تغيير كلمة السر بنجاح', 'success'); setNewPassword(''); }
      else { showMessage('❌ تفشل تحديث كلمة السر: ' + error.message, 'error'); }
    } catch { showMessage('❌ خطأ في الاتصال', 'error'); }
  };

  const handleRequestFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId || !paymentRef.trim()) return;
    try {
      const { error } = await supabase.from('cars').update({ status: 'pending_featured', featured_payment_ref: paymentRef.trim() }).eq('id', selectedCarId);
      if (!error) {
        showMessage('✅ تم إرسال طلب التمييز! بانتظار مراجعة الإدارة وتفعيل الحوالة.', 'success');
        setModalOpen(false); setPaymentRef(''); fetchProfileCarsAndSettings();
      } else { showMessage('❌ حدث خطأ أثناء إرسال الطلب', 'error'); }
    } catch { showMessage('❌ خطأ في الاتصال بالخادم', 'error'); }
  };
  return (
    <div style={{ direction: 'rtl', padding: '16px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>👋 إعدادات الملف الشخصي</h1>
          <Link href="/" style={{ textDecoration: 'none', fontSize: '12px', color: '#2563eb', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' }}>← تصفح المعرض الرئيسي</Link>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>خروج</button>
      </div>

      {message.text && <div style={{ padding: '12px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>{message.text}</div>}

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#475569' }}>⚙️ إعدادات الحساب</h2>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>البريد الإلكتروني</label><input type="text" disabled value={email} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b' }} /></div>
          <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>الاسم الكامل</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
          <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>رقم الهاتف</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
          <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💾 حفظ التغييرات</button>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#475569' }}>🔑 تغيير كلمة السر</h2>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة السر الجديدة" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} /></div>
          <button type="submit" style={{ padding: '12px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🔑 تغيير كلمة السر</button>
        </form>
      </div>

      <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#475569' }}>🚗 إعلاناتي الحالية ({myCars.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>⏳ جاري تحميل إعلاناتك...</p> : myCars.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '15px' }}>📭 لم تقم بنشر أي إعلانات سيارات حتى الآن.</p> : myCars.map((car) => (
          <div key={car.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '14px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {car.images && car.images.length > 0 && <img src={car.images[0]} alt="car" style={{ width: '65px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />}
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{car.brand} {car.model}</div>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>{car.price} {car.currency || 'د.ك'}</div>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px', backgroundColor: car.status === 'sold' ? '#fee2e2' : car.status === 'pending' ? '#fef3c7' : car.status === 'pending_featured' ? '#ffedd5' : '#d1fae5', color: car.status === 'sold' ? '#ef4444' : car.status === 'pending' ? '#d97706' : car.status === 'pending_featured' ? '#ea580c' : '#16a34a' }}>{car.status === 'sold' ? 'مباع 🔒' : car.status === 'pending' ? 'قيد مراجعة النشر' : car.status === 'pending_featured' ? 'قيد مراجعة التمييز ⏳' : 'نشط متوفر ✅'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <Link href={`/car/${car.id}`} style={{ textDecoration: 'none' }}><button style={{ width: '100%', padding: '5px 10px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🔍 معاينة</button></Link>
              {!car.is_featured && car.status === 'approved' && <button onClick={() => { setSelectedCarId(car.id); setModalOpen(true); }} style={{ padding: '6px 12px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(234,179,8,0.2)' }}>⭐ تمييز الإعلان</button>}
              {car.is_featured && <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 'bold', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '6px', textAlign: 'center' }}>👑 مميز نشط</span>}
            </div>
          </div>
        ))}
      </div>
            {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', direction: 'rtl' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>⭐ طلب تمييز الإعلان في الشريط العلوي</h3>
            <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '8px', fontSize: '14px', color: '#1e40af', fontWeight: 'bold', marginBottom: '15px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
              💰 تكلفة تمييز الإعلان: {livePrice} دينار كويتي / شهرياً
            </div>
            
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>قم بالسداد الفوري عبر بايبال بالضغط بالأسفل، أو التحويل عبر ويسترن يونيون، ثم اكتب رقم الحوالة للتفعيل المباشر:</p>
            
            <a href={`https://paypal.com{encodeURIComponent(livePaypal)}&currency_code=KWD&amount=${livePrice}&item_name=Premium%20Car%20Featured%20Ad%20Sayarty%20Store`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: '15px' }}>
              <button type="button" style={{ width: '100%', padding: '12px', backgroundColor: '#0070ba', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                💳 ادفع الآن فورا عبر PayPal
              </button>
            </a>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#334155', border: '1px solid #e2e8f0', marginBottom: '15px', lineHeight: '1.6' }}>
              📌 <strong>ويسترن يونيون:</strong> {liveWestern}<br/>
              📧 <strong>حساب بايبال اليدوي:</strong> {livePaypal}
            </div>

            <form onSubmit={handleRequestFeatured}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>رقم المرجع (رقم الحوالة أو إيميل بايبال المحول منه):</label>
                <input type="text" required value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} placeholder="إيميل حسابك في بايبال أو رقم إيصال WU" />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ padding: '9px 15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>✉️ إرسال طلب التفعيل</button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '9px 15px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

