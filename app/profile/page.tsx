"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  images: string | string[] | null;
  is_featured?: boolean;
  featured_status?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // حالات التحكم في منبثقة الدفع والتمييز
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  useEffect(() => {
    // جلب بيانات المستخدم وإعلاناته الشخصية عند فتح الصفحة
    const fetchProfileData = async () => {
      try {
        const res = await fetch('/api/user/profile'); // مسار جلب ملف العميل الافتراضي بموقعك
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setCars(data.cars || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // دالة إرسال طلب تمييز الإعلان للأدمن بعد تحويل الأموال
  const handleRequestFeature = async () => {
    if (!selectedCarId) return;
    try {
      setActionLoading(selectedCarId);
      setShowPaymentModal(false);

      const res = await fetch(`/api/car/${selectedCarId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured_status: 'pending' })
      });

      if (res.ok) {
        alert('⭐ تم إرسال طلب تمييز الإعلان بنجاح! سيقوم المشرف بمراجعة الدفع وتفعيله فوراً.');
        // تحديث البيانات محلياً
        setCars(prev => prev.map(c => c.id === selectedCarId ? { ...c, featured_status: 'pending' } : c));
      } else {
        alert('❌ فشل إرسال الطلب، يرجى المحاولة لاحقاً');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
      setSelectedCarId(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>جاري تحميل الملف الشخصي...</div>;

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* قسم الهيدر الأزرق العلوي لحسابك الموضح بالصورة */}
      <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>👤 حسابي الشخصي</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>{user?.email || 'mara7b@gmail.com'}</p>
      </div>

      {/* أزرار التنقل السريع */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => router.push('/')} style={{ padding: '10px 16px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🏠 العودة الرئيسية</button>
        <button onClick={() => router.push('/dashboard/cars/new')} style={{ padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>➕ نشر إعلان سيارة جديد</button>
      </div>

      {/* قسم قائمة إعلاناتي (2) الموضح بالصورة */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#1e293b' }}>🚘 إعلاناتي ({cars.length})</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {cars.map((car) => (
            <div key={car.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', backgroundColor: '#fff', position: 'relative' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{car.brand} {car.model}</h3>
              <p style={{ color: '#059669', fontWeight: 'bold', margin: '0 0 10px 0' }}>{car.price} د.ك</p>
              
              {/* شريط التحكم المدفوع الذكي التابع لطلب التميز */}
              <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {car.is_featured ? (
                  <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '6px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #f59e0b' }}>🌟 إعلان مميز نشط لايف</span>
                ) : car.featured_status === 'pending' ? (
                  <span style={{ backgroundColor: '#f3f4f6', color: '#4b5563', padding: '6px', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }}>⏳ قيد المراجعة الماليّة</span>
                ) : (
                  <button 
                    disabled={actionLoading === car.id}
                    onClick={() => { setSelectedCarId(car.id); setShowPaymentModal(true); }}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    ⭐ ترقية لإعلان مميز (مدفوع)
                  </button>
                )}
                <button onClick={() => router.push(`/car/${car.id}`)} style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>🔍 معاينة الإعلان</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* منبثقة تفاصيل وطرق الدفع الكاش للعميل */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>⭐ ترقية الإعلان إلى مميز</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>تمنحك الترقية ظهور سيارتك في أعلى نتائج البحث بالصفحة الرئيسية دائماً وبإطار ذهبي لزيادة سرعة البيع.</p>
            
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
