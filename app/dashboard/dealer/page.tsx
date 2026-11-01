'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function DealerDashboardSettings() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dealer, setDealer] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    owner_email: '',
    logo_url: ''
  });

  useEffect(() => {
    fetchDealerProfile();
  }, []);

  async function fetchDealerProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // جلب بيانات المعرض المرتبط بالمستخدم الحالي
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setDealer(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          address: data.address || '',
          owner_email: user.email || data.owner_email || '',
          logo_url: data.logo_url || ''
        });
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
        .from('dealers-logos') // اسم الـ Bucket في Supabase
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // الحصول على الرابط العام للصورة
      const { data: publicUrlData } = supabase.storage
        .from('dealers-logos')
        .getPublicUrl(filePath);

      const logoUrl = publicUrlData.publicUrl;
      setFormData(prev => ({ ...prev, logo_url: logoUrl }));

      // تحديث القاعدة مباشرة بالشعار الجديد
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
    <div style={{ direction: 'rtl', maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '25px', textAlign: 'center' }}>
          ⚙️ إدارة إعدادات المعرض
        </h2>

        {/* قسم رفع الشعار */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '110px', height: '110px', borderRadius: '50%', margin: '0 auto 15px', overflow: 'hidden', border: '3px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="شعار المعرض" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '36px', color: '#94a3b8' }}>🏢</span>
            )}
          </div>

          <label style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#fff', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
            {uploading ? 'جاري الرفع...' : '📷 رفع / تغيير شعار المعرض'}
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>

        {/* نموذج البيانات */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* البريد الإلكتروني (يظهر للمستخدم والأدمن) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
              📧 بريد مالك المعرض (مرئي للأدمن)
            </label>
            <input 
              type="email" 
              value={formData.owner_email} 
              readOnly 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b' }} 
            />
          </div>

          {/* اسم المعرض */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
              اسم المعرض
            </label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
            />
          </div>

          {/* الهاتف والواتساب */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
                رقم الهاتف
              </label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
                رقم الواتساب
              </label>
              <input 
                type="text" 
                value={formData.whatsapp} 
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
              />
            </div>
          </div>

          {/* العنوان */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>
              موقع / عنوان المعرض
            </label>
            <input 
              type="text" 
              value={formData.address} 
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: '#0f172a', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>

        </form>

      </div>
    </div>
  );
}
