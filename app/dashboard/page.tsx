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

export default function UserDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [myCars, setMyCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  // حالات النافذة المنبثقة لطلب تمييز الإعلان المدفوع
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchUserDataAndCars = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // جلب اسم المستخدم
      const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).single();
      if (profile) setUserName(profile.name || 'مستخدم');

      // جلب إعلانات المستخدم الخاصة به فقط
      const { data: carData } = await supabase.from('cars').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (carData) setMyCars(carData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserDataAndCars(); }, []);

  const handleRequestFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId || !paymentRef.trim()) return;

    try {
      // تحديث حالة السيارة ورقم الحوالة لإرسالها للمدير
      const { error } = await supabase
        .from('cars')
        .update({ status: 'pending_featured', featured_payment_ref: paymentRef.trim() })
        .eq('id', selectedCarId);

      if (!error) {
        setMessage({ text: '✅ تم إرسال طلب التمييز بنجاح! بانتظار مراجعة الإدارة وتفعيل الحوالة.', type: 'success' });
        setModalOpen(false);
        setPaymentRef('');
        fetchUserDataAndCars();
      } else {
        setMessage({ text: '❌ حدث خطأ أثناء إرسال الطلب', type: 'error' });
      }
    } catch {
      setMessage({ text: '❌ خطأ في الاتصال بالخادم', type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };
  return (
    <div style={{ direction: 'rtl', padding: '16px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>👋 أهلاً بك، {userName}</h1>
          <Link href="/" style={{ textDecoration: 'none', fontSize: '12px', color: '#2563eb', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' }}>← تصفح المعرض الرئيسي</Link>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => router.push('/dashboard/cars/new')} style={{ padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>➕ إضافة إعلان</button>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>خروج</button>
        </div>
      </div>

      {message.text && (
        <div style={{ padding: '12px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
          {message.text}
        </div>
      )}

      <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#475569' }}>🚘 إعلاناتي الحالية ({myCars.length})</h2>

      {loading ? <p style={{ textAlign: 'center', color: '#64748b' }}>⏳ جاري تحميل سياراتك...</p> : myCars.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>📭 لم تقم بنشر أي إعلانات سيارات حتى الآن.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {myCars.map((car) => (
            <div key={car.id} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {car.images && car.images.length > 0 && <img src={car.images[0]} alt="car" style={{ width: '60px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{car.brand} {car.model} ({car.year})</div>
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>{car.price} {car.currency || 'د.ك'}</div>
                  
                  {/* شارات الحالة المعروضة للمستخدم */}
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px', backgroundColor: car.status === 'sold' ? '#fee2e2' : car.status === 'pending' ? '#fef3c7' : car.status === 'pending_featured' ? '#ffedd5' : '#d1fae5', color: car.status === 'sold' ? '#ef4444' : car.status === 'pending' ? '#d97706' : car.status === 'pending_featured' ? '#ea580c' : '#16a34a' }}>
                    {car.status === 'sold' ? 'مباع 🔒' : car.status === 'pending' ? 'قيد مراجعة النشر' : car.status === 'pending_featured' ? 'قيد مراجعة التمييز ⏳' : 'نشط متوفر ✅'}
                  </span>
                </div>
              </div>

              {/* أزرار الإجراءات لطلب التمييز المدفوع */}
              <div>
                {!car.is_featured && car.status === 'approved' && (
                  <button onClick={() => { setSelectedCarId(car.id); setModalOpen(true); }} style={{ padding: '6px 12px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(234,179,8,0.2)' }}>⭐ تمييز الإعلان</button>
                )}
                {car.is_featured && (
                  <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 'bold', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '6px' }}>👑 إعلان مميز نشط</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📥 النافذة المنبثقة الذكية (Modal) لإرسال بيانات الحوالة المدفوعة */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', direction: 'rtl' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#1e293b' }}>⭐ طلب تمييز الإعلان في الشريط العلوي</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '15px', leading: '1.5' }}>قم بتحويل رسوم التمييز عبر أحد الحسابات التالية، ثم اكتب رقم الإيصال أو اسم المحول بالأسفل لتفعيل الإعلان فوراً:</p>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#334155', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
              💰 <strong>ويسترن يونيون:</strong> الاسم الكامل: مدير الموقع - الكويت<br/>
              📧 <strong>بايبال الفوري:</strong> admin@sayarty.store
            </div>

            <form onSubmit={handleRequestFeatured}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>رقم الحوالة المرجعي أو إيميل الدفع:</label>
                <input type="text" required value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} placeholder="مثال: WU-987654321 أو حساب الـ PayPal" />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="submit" style={{ padding: '9px 15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>✉️ إرسال طلب التمييز</button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '9px 15px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
