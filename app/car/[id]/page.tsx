'use client';

import { useEffect, useState} from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Car {
  id: string;
  brand: string;
  model: string;
  price: number;
  year?: number;
  kilometers?: number;
  color?: string;
  description?: string;
  currency?: string;
  status: string;
  created_at: string;
  images?: string[];
  phone?: string; // لضمان ظهور رقم التواصل إن وجد
}

export default function CarDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  // قراءة الـ id بشكل آمن وديناميكي تماماً من الرابط
  const id = params?.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCarDetail = async () => {
      try {
        setLoading(true);
        console.log('🔍 جاري جلب تفاصيل السيارة لمعرّف:', id);
        
        // استدعاء الـ API الداخلي المجهز مسبقاً في مشروعك
        const res = await fetch(`/api/car/${id}`);
        
        if (!res.ok) {
          throw new Error('فشل في جلب بيانات السيارة من الخادم');
        }

        const data = await res.json();
        
        if (data && data.id) {
          setCar(data);
          if (data.images && data.images.length > 0) {
            setActiveImage(data.images[0]);
          }
        } else {
          setError('لم يتم العثور على السيارة المطلوبة');
        }
      } catch (err: any) {
        console.error('❌ خطأ تفاصيل السيارة:', err);
        setError('حدث خطأ أثناء تحميل تفاصيل السيارة');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ direction: 'rtl', padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
        ⏳ جاري جلب كامل مواصفات السيارة...
      </div>
    );
  }

  if (error || !car) {
    return (
      <div style={{ direction: 'rtl', padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '18px', color: '#dc2626', marginBottom: '20px' }}>
          ⚠️ {error || 'عذراً، لم يتم العثور على السيارة المطلوبة'}
        </div>
        <Link href="/">
          <button style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            🔙 العودة للرئيسية
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', padding: '16px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* زر العودة التفاعلي */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '600', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          🔀 تصفح باقي السيارات
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
        
        {/* معرض الصور الفاخر */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ width: '100%', height: '240px', backgroundColor: '#f8fafc', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            <img 
              src={activeImage || '/default-car.jpg'} 
              alt={car.brand} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          
          {/* المصغرات للتنقل بين الصور */}
          {car.images && car.images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
              {car.images.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(img)}
                  style={{ width: '60px', height: '50px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: activeImage === img ? '2px solid #2563eb' : '1px solid #cbd5e1', flexShrink: 0 }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الاسم والسعر */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
            {car.brand} {car.model}
          </h1>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a' }}>
            {car.price} {car.currency || 'د.ك'}
          </span>
        </div>

        {/* المواصفات الأساسية */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
          {car.year && <div style={{ fontSize: '14px', color: '#334155' }}>📅 <b>سنة الصنع:</b> {car.year}</div>}
          {car.kilometers && <div style={{ fontSize: '14px', color: '#334155' }}>📊 <b>الممشى:</b> {car.kilometers.toLocaleString()} كم</div>}
          {car.color && <div style={{ fontSize: '14px', color: '#334155' }}>🎨 <b>اللون:</b> {car.color}</div>}
          <div style={{ fontSize: '14px', color: '#334155' }}>🕐 <b>تاريخ النشر:</b> {new Date(car.created_at).toLocaleDateString('ar-KW')}</div>
        </div>

        {/* تفاصيل والوصف الكامل للمعلن */}
        {car.description && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>📝 تفاصيل الإعلان الكاملة:</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0, backgroundColor: '#fcfcfc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              {car.description}
            </p>
          </div>
        )}

        {/* أزرار التواصل المباشرة الفاخرة */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a 
            href={`tel:${car.phone || '00000000'}`} 
            style={{ width: '100%', padding: '14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', display: 'block', boxShadow: '0 4px 10px rgba(22,163,74,0.15)' }}
          >
            📞 إتصال مباشر بالبائع
          </a>
        </div>

      </div>
    </div>
  );
}
