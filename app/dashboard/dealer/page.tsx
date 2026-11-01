'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function DealerDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dealer, setDealer] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    owner_email: '',
    logo_url: ''
  });

  useEffect(() => {
    fetchDealerData();
  }, []);

  async function fetchDealerData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // 1. جلب بيانات المعرض
      const { data: dealerData, error: dealerError } = await supabase
        .from('dealers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (dealerData) {
        setDealer(dealerData);
        setFormData({
          name: dealerData.name || '',
          phone: dealerData.phone || '',
          whatsapp: dealerData.whatsapp || '',
          address: dealerData.address || '',
          owner_email: user.email || dealerData.owner_email || '',
          logo_url: dealerData.logo_url || ''
        });

        // 2. جلب سيارات هذا المعرض
        const { data: carsData } = await supabase
          .from('cars')
          .select('*')
          .eq('dealer_id', dealerData.id)
          .order('created_at', { ascending: false });

        if (carsData) setCars(carsData);
      }
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
    } finally {
      setLoading(false);
    }
  }

  // رفع الشعار إلى Supabase Storage
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `dealers-logos/${dealer.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('dealers-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('dealers-logos')
        .getPublicUrl(filePath);

      const logoUrl = publicUrlData.publicUrl;
      setFormData(prev => ({ ...prev, logo_url: logoUrl }));

      await supabase
        .from('dealers')
        .update({ logo_url: logoUrl })
        .eq('id', dealer.id);

      alert('تم رفع الشعار بنجاح! 🎉');
    } catch (error: any) {
      alert('حدث خطأ أثناء رفع الشعار: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // حفظ التعديلات العامة
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('dealers')
        .update({
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          address: formData.address,
          owner_email: formData.owner_email,
        })
        .eq('id', dealer.id);

      if (error) throw error;
      alert('تم حفظ بيانات المعرض بنجاح!');
    } catch (error: any) {
      alert('خطأ أثناء الحفظ: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !dealer) return <div style={{ textAlign: 'center', padding: '50px' }}>جاري التحميل...</div>;

  return (
    <div style={{ direction: 'rtl', maxWidth: '900px', margin: '30px auto', fontFamily: 'sans-serif', padding: '15px' }}>
      
      {/* 1. رأس الصفحة وأزرار التنقل السريع بين اللوحة والصفحة العامة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>🏢 لوحة إدارة المعرض</h1>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {dealer?.slug && (
            <Link 
              href={`/dealer/${dealer.slug}`} 
              style={{ backgroundColor: '#2563eb', color: '#fff', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}
            >
              🌐 عرض المعرض العام
            </Link>
          )}
          <Link 
            href="/add-car" 
            style={{ backgroundColor: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}
          >
            ➕ إضافة سيارة
          </Link>
          <Link 
            href="/" 
            style={{ backgroundColor: '#64748b', color: '#fff', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}
          >
            🏠 الرئيسية
          </Link>
        </div>
      </div>

      {/* 2. قسم تعديل الإعدادات ورفع الشعار */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>⚙️ إعدادات المعرض والشعار</h2>

        {/* رفع الشعار */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 12px', overflow: 'hidden', border: '3px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="شعار المعرض" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '36px', color: '#94a3b8' }}>🏢</span>
            )}
          </div>

          <label style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
            {uploading ? 'جاري الرفع...' : '📷 رفع / تغيير الشعار'}
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>

        {/* نموذج بيانات المعرض */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>📧 بريد مالك المعرض (مرئي للأدمن)</label>
            <input type="email" value={formData.owner_email} readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>اسم المعرض</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>رقم الهاتف</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>رقم الواتساب</label>
              <input type="text" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>موقع / عنوان المعرض</label>
            <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: '#0f172a', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>

      {/* 3. قسم عرض إدارة سيارات المعرض الحالية */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
          🚗 سيارات المعرض الحالية ({cars.length})
        </h2>

        {cars.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>لا توجد سيارات مرتبطة بالمعرض حالياً.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {cars.map((car) => {
              const carImage = car.images && car.images.length > 0 ? car.images[0] : null;
              return (
                <div key={car.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', backgroundColor: '#f8fafc' }}>
                  {carImage && <img src={carImage} alt={car.brand} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />}
                  <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{car.brand} {car.model}</h3>
                  <p style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>{car.price ? `${car.price} ريال` : 'السعر عند الاتصال'}</p>
                  <Link href={`/car/${car.id}`} style={{ display: 'block', textAlign: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', marginTop: '8px' }}>
                    معاينة الإعلان 👁️
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
