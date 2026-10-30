import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function DealerPublicProfile({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { slug } = params;

  // 1. جلب بيانات المعرض بواسطة الـ slug
  const { data: dealer, error: dealerError } = await supabase
    .from('dealers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (dealerError || !dealer) {
    return notFound();
  }

  // 2. جلب السيارات التابعة لهذا المعرض فقط
  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('*')
    .eq('dealer_id', dealer.id);

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* رأس صفحة المعرض (الهوية وبطاقة التعريف) */}
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px', textAlign: 'center' }}>
          
          <div style={{ width: '80px', height: '80px', backgroundColor: '#e0e7ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 15px', fontWeight: 'bold' }}>
            {dealer.name.charAt(0)}
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
            {dealer.name} {dealer.is_verified && <span style={{ color: '#2563eb', fontSize: '18px' }} title="معرض موثق">✓</span>}
          </h1>

          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
            📍 {dealer.address || 'المملكة العربية السعودية'}
          </p>

          {/* أزرار التواصل السريع */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {dealer.phone && (
              <a 
                href={`tel:${dealer.phone}`}
                style={{ backgroundColor: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}
              >
                📞 اتصال مباشر
              </a>
            )}
            {dealer.whatsapp && (
              <a 
                href={`https://wa.me/${dealer.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: '#16a34a', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}
              >
                💬 مراسلة واتساب
              </a>
            )}
          </div>

        </div>

        {/* قسم السيارات المعروضة */}
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
          سيارات المعرض المتاحة ({cars?.length || 0})
        </h2>

        {!cars || cars.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
            <p>لا توجد سيارات مضافة حالياً في هذا المعرض.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {cars.map((car) => (
              <div key={car.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                  {car.title || car.model || 'سيارة للبيع'}
                </h3>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', marginBottom: '15px' }}>
                  {car.price ? `${car.price} ريال` : 'السعر عند الاتصال'}
                </p>
                <a 
                  href={`/cars/${car.id}`}
                  style={{ display: 'block', textAlign: 'center', backgroundColor: '#f1f5f9', color: '#0f172a', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}
                >
                  عرض التفاصيل
                </a>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
