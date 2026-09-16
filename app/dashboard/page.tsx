'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface Car {
  id: string; brand: string; model: string; price: number;
  year?: number; currency?: string; status: string; images?: string[];
  is_featured?: boolean; featured_payment_ref?: string;
  featured_until?: string;
  user_id?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [myCars, setMyCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // ✅ جلب بيانات المستخدم مع الدور
      const { data: profile } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserName(profile.name || 'مستخدم');
        const adminRole = profile.role === 'admin' || profile.role === 'super_admin';
        setIsAdmin(adminRole);

        // ✅ إذا كان أدمن → جلب جميع الإعلانات
        if (adminRole) {
          let query = supabase
            .from('cars')
            .select('*')
            .order('created_at', { ascending: false });

          if (filter !== 'all') {
            query = query.eq('status', filter);
          }

          const { data: carData } = await query;
          if (carData) setMyCars(carData);
        } else {
          // ✅ مستخدم عادي → جلب إعلاناته فقط
          const { data: carData } = await supabase
            .from('cars')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (carData) setMyCars(carData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  // ✅ طلب التمييز (للمستخدم)
  const handleRequestFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId || !paymentRef.trim()) return;

    try {
      const { error } = await supabase
        .from('cars')
        .update({ status: 'pending_featured', featured_payment_ref: paymentRef.trim() })
        .eq('id', selectedCarId);

      if (!error) {
        showMessage('✅ تم إرسال طلب التمييز بنجاح!', 'success');
        setModalOpen(false);
        setPaymentRef('');
        fetchData();
      } else {
        showMessage('❌ حدث خطأ أثناء إرسال الطلب', 'error');
      }
    } catch {
      showMessage('❌ خطأ في الاتصال بالخادم', 'error');
    }
  };

  // ✅ قبول التمييز (للأدمن) - مع تحديد 30 يوم
  const featureCar = async (carId: string) => {
    try {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + 30);

      const { error } = await supabase
        .from('cars')
        .update({
          is_featured: true,
          status: 'approved',
          featured_until: featuredUntil.toISOString(),
        })
        .eq('id', carId);

      if (error) {
        showMessage('❌ فشل التمييز: ' + error.message, 'error');
      } else {
        showMessage('⭐ تم تمييز الإعلان لمدة 30 يوم', 'success');
        fetchData();
      }
    } catch {
      showMessage('❌ خطأ في الاتصال', 'error');
    }
  };

  // ✅ إلغاء التمييز (للأدمن)
  const unfeatureCar = async (carId: string) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ is_featured: false, featured_until: null })
        .eq('id', carId);

      if (!error) {
        showMessage('تم إلغاء التمييز', 'success');
        fetchData();
      }
    } catch {
      showMessage('❌ خطأ', 'error');
    }
  };

  // ✅ تغيير الحالة (للأدمن)
  const updateCarStatus = async (carId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ status: newStatus })
        .eq('id', carId);

      if (!error) {
        showMessage('✅ تم التحديث بنجاح', 'success');
        fetchData();
      }
    } catch {
      showMessage('❌ خطأ', 'error');
    }
  };

  // ✅ حذف الإعلان (للأدمن)
  const deleteCar = async (carId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    try {
      const { error } = await supabase.from('cars').delete().eq('id', carId);
      if (!error) {
        showMessage('🗑️ تم حذف الإعلان', 'success');
        fetchData();
      }
    } catch {
      showMessage('❌ خطأ', 'error');
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '16px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* الهيدر */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
            {isAdmin ? '⚙️ لوحة الإدارة' : `👋 أهلاً بك، ${userName}`}
          </h1>
          <Link href="/" style={{ textDecoration: 'none', fontSize: '12px', color: '#2563eb', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' }}>← الرئيسية</Link>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {!isAdmin && (
            <button onClick={() => router.push('/dashboard/cars/new')} style={{ padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>➕ إعلان جديد</button>
          )}
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>خروج</button>
        </div>
      </div>

      {/* الرسائل */}
      {message.text && (
        <div style={{ padding: '12px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
          {message.text}
        </div>
      )}

      {/* فلاتر الأدمن */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'الكل' },
            { key: 'pending', label: '⏳ للمراجعة' },
            { key: 'pending_featured', label: '⭐ طلبات تمييز' },
            { key: 'approved', label: '✅ نشط' },
            { key: 'sold', label: '💰 مباع' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 12px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: filter === f.key ? '#2563eb' : '#f1f5f9',
                color: filter === f.key ? 'white' : '#475569',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', color: '#475569' }}>
        {isAdmin ? `📊 جميع الإعلانات (${myCars.length})` : `🚘 إعلاناتي (${myCars.length})`}
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>⏳ جاري التحميل...</p>
      ) : myCars.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>📭 لا توجد إعلانات</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {myCars.map((car) => (
            <div key={car.id} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
                {car.images && car.images.length > 0 && <img src={car.images[0]} alt="car" style={{ width: '60px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{car.brand} {car.model} ({car.year})</div>
                  <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', marginTop: '2px' }}>{car.price} {car.currency || 'د.ك'}</div>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px', backgroundColor: car.status === 'sold' ? '#fee2e2' : car.status === 'pending' ? '#fef3c7' : car.status === 'pending_featured' ? '#ffedd5' : '#d1fae5', color: car.status === 'sold' ? '#ef4444' : car.status === 'pending' ? '#d97706' : car.status === 'pending_featured' ? '#ea580c' : '#16a34a' }}>
                    {car.status === 'sold' ? 'مباع 🔒' : car.status === 'pending' ? 'قيد المراجعة' : car.status === 'pending_featured' ? '⭐ طلب تمييز' : '✅ نشط'}
                  </span>
                  {car.featured_payment_ref && (
                    <div style={{ fontSize: '11px', color: '#ea580c', marginTop: '4px' }}>💳 {car.featured_payment_ref}</div>
                  )}
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                
                {/* ====== أزرار الأدمن ====== */}
                {isAdmin && (
                  <>
                    {car.status === 'pending' && (
                      <>
                        <button onClick={() => updateCarStatus(car.id, 'approved')} style={{ padding: '6px 10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>✅ قبول</button>
                        <button onClick={() => deleteCar(car.id)} style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>❌ رفض</button>
                      </>
                    )}

                    {car.status === 'pending_featured' && (
                      <>
                        <button onClick={() => featureCar(car.id)} style={{ padding: '6px 10px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>⭐ تمييز 30 يوم</button>
                        <button onClick={() => updateCarStatus(car.id, 'approved')} style={{ padding: '6px 10px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>رفض التمييز</button>
                      </>
                    )}

                    {car.is_featured && (
                      <button onClick={() => unfeatureCar(car.id)} style={{ padding: '6px 10px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء التمييز</button>
                    )}

                    {car.status === 'approved' && !car.is_featured && (
                      <>
                        <button onClick={() => updateCarStatus(car.id, 'sold')} style={{ padding: '6px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>💰 مباع</button>
                        <button onClick={() => featureCar(car.id)} style={{ padding: '6px 10px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>⭐ تمييز</button>
                      </>
                    )}

                    {car.status === 'sold' && (
                      <button onClick={() => updateCarStatus(car.id, 'approved')} style={{ padding: '6px 10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 إعادة نشر</button>
                    )}

                    <Link href={`/car/${car.id}`} style={{ textDecoration: 'none' }}>
                      <button style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>👁️ عرض</button>
                    </Link>

                    <button onClick={() => deleteCar(car.id)} style={{ padding: '6px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ حذف</button>
                  </>
                )}

                {/* ====== أزرار المستخدم العادي ====== */}
                {!isAdmin && (
                  <>
                    <Link href={`/car/${car.id}`} style={{ textDecoration: 'none' }}>
                      <button style={{ padding: '6px 10px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🔍 معاينة</button>
                    </Link>

                    {!car.is_featured && car.status === 'approved' && (
                      <button onClick={() => { setSelectedCarId(car.id); setModalOpen(true); }} style={{ padding: '6px 10px', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>⭐ تمييز الإعلان</button>
                    )}

                    {car.is_featured && car.featured_until && (() => {
                      const daysLeft = Math.ceil((new Date(car.featured_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      if (daysLeft <= 0) return <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '6px' }}>❌ انتهى التمييز</span>;
                      if (daysLeft <= 5) return <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 'bold', backgroundColor: '#ffedd5', padding: '4px 8px', borderRadius: '6px' }}>⚠️ ينتهي خلال {daysLeft} أيام</span>;
                      return <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 'bold', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '6px' }}>👑 مميز ({daysLeft} يوم)</span>;
                    })()}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال طلب التمييز (للمستخدم) */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '15px' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', width: '100%', maxWidth: '400px', direction: 'rtl' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#1e293b' }}>⭐ طلب تمييز الإعلان</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '15px' }}>قم بتحويل رسوم التمييز ثم اكتب رقم الحوالة:</p>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#334155', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
              💰 <strong>ويسترن يونيون:</strong> مدير الموقع - الكويت<br/>
              📧 <strong>بايبال:</strong> admin@sayarty.store
            </div>
            <form onSubmit={handleRequestFeatured}>
              <input type="text" required value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} placeholder="رقم الحوالة..." />
              <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '9px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>✉️ إرسال</button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, padding: '9px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
