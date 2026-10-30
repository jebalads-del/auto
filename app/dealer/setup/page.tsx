'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function DealerSetupPage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('يرجى تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      // تنظيف الـ slug وتحويله إلى حروف صغيرة وبدون مساحات
      const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');

      // إنشاء المعرض بحالة غير موثقة تلقائياً
      const { error: insertError } = await supabase
        .from('dealers')
        .insert([
          {
            user_id: user.id,
            name,
            slug: cleanSlug,
            phone,
            whatsapp,
            address,
            cr_number: crNumber,
            is_verified: false // 🛑 بانتظار موافقة الإدارة
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('رابط المعرض (Slug) مستخدم مسبقاً، يرجى اختيار رابط آخر');
        }
        throw insertError;
      }

      // تحديث دور المستخدم في ملفه إلى dealer
      await supabase
        .from('profiles')
        .update({ role: 'dealer' })
        .eq('id', user.id);

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل المعرض');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>⏳</div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>تم إرسال طلب تسجيل المعرض بنجاح!</h1>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
            شكرًا لك. طلبك الآن قيد المراجعة والتدقيق من قبل إدارة المنصة. سيتم توثيق معرضك وتفعيله فور التأكد من البيانات.
          </p>
          <button 
            onClick={() => router.push('/')}
            style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', textAlign: 'center' }}>🏢 تسجيل معرض / شركة جديد</h1>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '25px', textAlign: 'center' }}>أدخل بيانات معرضك لتتم مراجعتها وتوثيق حسابك في المنصة</p>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>اسم المعرض / الشركة *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: معرض النخبة للسيارات" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>رابط المعرض بالإنجليزية (Slug) *</label>
            <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="مثال: elite-cars" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', direction: 'ltr' }} />
            <small style={{ color: '#94a3b8', fontSize: '11px' }}>سيكون رابط معرضك: sayarty.store/dealers/{slug || 'your-slug'}</small>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>رقم الاتصال *</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0500000000" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', direction: 'ltr' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>رقم الواتساب *</label>
              <input type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="966500000000" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', direction: 'ltr' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>العنوان / المدينة *</label>
            <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="مثال: الرياض - حي الشفاء" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>رقم السجل التجاري</label>
            <input type="text" value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder="اختياري" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', direction: 'ltr' }} />
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? 'جاري إرسال الطلب...' : 'إرسال طلب التوثيق والتسجيل'}
          </button>
        </form>
      </div>
    </div>
  );
}
