'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function DealerSetupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    phone: '',
    whatsapp: '',
    address: '',
    cr_number: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      // 1. إدخال بيانات المعرض في جدول dealers
      const { error: dealerError } = await supabase.from('dealers').insert({
        user_id: user.id,
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address,
        cr_number: formData.cr_number,
        is_verified: false, // يحتاج موافقة الإدارة لاحقاً
      });

      if (dealerError) throw dealerError;

      // 2. تحديث حالة الحساب في profiles ليكون معلقاً بانتظار الموافقة
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ dealer_status: 'pending' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      alert('تم تقديم طلب تسجيل المعرض بنجاح! سيتم مراجعته وتفعيله قريباً.');
      router.push('/');
    } catch (err: any) {
      console.error('Error setting up dealer:', err);
      alert(err.message || 'حدث خطأ أثناء حفظ البيانات، يرجى التأكد من أن معرف المعرض (Slug) غير مستخدم من قبل.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', textAlign: 'center' }}>
          إعداد ملف المعرض أو الشركة 🏢
        </h1>
        <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '14px', textAlign: 'center' }}>
          أدخل بياناتك التجارية لنشر صفحتك الخاصة وتفعيل لوحة تحكم المعارض.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>اسم المعرض أو الشركة *</label>
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="مثال: معرض النخبة للسيارات" 
              value={formData.name} 
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>رابط المعرض التعريفي (Slug بالانجليزية بدون مسافات) *</label>
            <input 
              type="text" 
              name="slug" 
              required 
              placeholder="elite-cars" 
              value={formData.slug} 
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>رقم الجوال *</label>
              <input 
                type="text" 
                name="phone" 
                required 
                placeholder="05xxxxxxxx" 
                value={formData.phone} 
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>رقم الواتساب *</label>
              <input 
                type="text" 
                name="whatsapp" 
                required 
                placeholder="9665xxxxxxxx" 
                value={formData.whatsapp} 
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>رقم السجل التجاري أو الترخيص *</label>
            <input 
              type="text" 
              name="cr_number" 
              required 
              placeholder="1010xxxxxx" 
              value={formData.cr_number} 
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>عنوان المعرض (المدينة / الحي) *</label>
            <input 
              type="text" 
              name="address" 
              required 
              placeholder="الرياض - معرض السيارات" 
              value={formData.address} 
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '10px', backgroundColor: '#2563eb', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {loading ? 'جاري حفظ البيانات...' : 'إرسال الطلب وحفظ البيانات'}
          </button>

        </form>

      </div>
    </div>
  );
}
