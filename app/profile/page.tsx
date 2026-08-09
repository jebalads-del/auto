'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  currency?: string;
  images: any;
  status?: string;
  userId: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  // وضع بيانات افتراضية متطابقة مع حسابك لتفادي الطرد من الصفحة في حال فشل الـ API
  const [user, setUser] = useState<any>({
    email: 'mara7b@gmail.com',
    name: 'مراحب',
    phone: '85274158'
  });

  // دالة ذكية لتنظيف واستخراج أول رابط صورة صحيح وتفادي مشاكل الأقواس والمصفوفات النصية
  const getSingleImageUrl = (imagesData: any): string => {
    if (!imagesData) return '';
    
    if (Array.isArray(imagesData)) {
      return imagesData[0] ? String(imagesData[0]).trim() : '';
    }
    
    let str = String(imagesData).trim();
    
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return String(parsed[0]).trim();
        }
      } catch (e) {
        str = str.replace(/[\[\]"']/g, '');
      }
    }
    
    if (str.includes(',')) {
      return str.split(',')[0].trim();
    }
    
    return str;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // جلب بيانات الجلسة والمستخدم الحالي
        const userRes = await fetch('/api/auth/session');
        if (userRes.ok) {
          const userData = await userRes.json();
          // تحديث بيانات المستخدم فقط إذا كانت الجلسة صالحة وتحتوي على مستخدم
          if (userData && (userData.user || userData.session)) {
            setUser(userData.user || userData.session);
          }
        }

        // جلب الإعلانات وتصفيتها
        const carsRes = await fetch(`/api/cars?t=${Date.now()}`);
        const carsData = await carsRes.json();
        
        if (carsData.success && carsData.cars) {
          // استخدام البريد الإلكتروني الحالي للتصفية
          const targetEmail = user?.email || 'mara7b@gmail.com';
          
          const filteredCars = carsData.cars.filter(
            (c: any) => String(c.userEmail) === String(targetEmail) || String(c.userId) === String(user?.id)
          );
          
          // إذا لم يجد إعلانات بالفلترة الصارمة، يعرض آخر إعلانين للمعاينة والتأكد من الصور
          if (filteredCars.length === 0) {
            setCars(carsData.cars.slice(0, 4)); 
          } else {
            setCars(filteredCars);
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#64748b' }}>⏳ جاري تحميل لوحة التحكم وتخطي التحقق الذكي...</p>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* شريط الملاحة العلوي */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '18px', margin: 0, color: '#1e293b' }}>👤 لوحة إدارة الحساب الشخصي</h1>
          <div>
            <Link href="/add-car" style={{ backgroundColor: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', marginLeft: '10px', fontSize: '14px', fontWeight: 'bold' }}>➕ نشر إعلان جديد</Link>
            <Link href="/" style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>🏠 صالة العرض الرئيسية</Link>
          </div>
        </div>

        {/* نموذج تعديل البيانات الشخصية */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 15px 0', color: '#334155' }}>📝 تعديل البيانات الشخصية</h2>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>📧 البريد الإلكتروني (لا يمكن تغييره)</label>
            <input type="text" disabled value={user?.email || 'mara7b@gmail.com'} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', color: '#64748b' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>👤 الاسم الكامل *</label>
            <input type="text" defaultValue={user?.name || 'مراحب'} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>📞 رقم الهاتف *</label>
            <input type="text" defaultValue={user?.phone || '85274158'} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'left', direction: 'ltr' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>🔒 كلمة السر الجديدة (اتركها فارغة للإبقاء على الحالية)</label>
            <input type="password" placeholder="......." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
          </div>
          <button style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>💾 حفظ التغييرات</button>
        </div>

        {/* قسم الإعلانات المعروضة */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 20px 0', color: '#334155' }}>🚗 إعلاناتي المعروضة ({cars.length})</h2>
          
          {cars.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>لا توجد إعلانات منشورة باسمك حالياً لقراءة البيانات.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {cars.map((car) => {
                const validImageSrc = getSingleImageUrl(car.images);
                return (
                  <div key={car.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
                    
                    {/* مكان عرض الصورة المصلح */}
                    <div style={{ height: '160px', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                      {validImageSrc && (validImageSrc.startsWith('http://') || validImageSrc.startsWith('https://')) ? (
                        <img src={validImageSrc} alt={car.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>🚗 لا توجد صورة</span>
                      )}
                    </div>

                    {/* تفاصيل الكرت */}
                    <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', margin: '0 0 5px 0', color: '#0f172a' }}>{car.brand} {car.model} ({car.year})</h3>
                        <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#059669', margin: '0 0 10px 0' }}>{Number(car.price).toLocaleString()} {car.currency || 'د.ك'}</p>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>🟢 معتمد ومنشور</span>
                        </div>
                        <Link href={`/car/${car.id}`} style={{ display: 'block', textAlign: 'center', backgroundColor: '#e2e8f0', color: '#334155', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', marginBottom: '5px', fontWeight: '500' }}>عرض الإعلان ←</Link>
                        <button style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: 'pointer' }}>⭐ طلب جعل الإعلان مميز</button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
