'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Car {
  id: string; brand?: string; model?: string; price: number; 
  status: string; created_at: string; is_featured?: boolean; 
  featured_payment_ref?: string;
}

export default function AdminDashboardForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [cars, setCars] = useState<Car[]>([]);
  const [activeTab, setActiveTab] = useState<'cars' | 'settings' | 'featured_requests'>('cars');
  const [message, setMessage] = useState({ text: '', type: '' });

  const [featuredPrice, setFeaturedPrice] = useState('15');
  const [westernUnionInfo, setWesternUnionInfo] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
    if (data) {
      setFeaturedPrice(data.featured_price?.toString() || '15');
      setWesternUnionInfo(data.western_union_info || '');
      setPaypalEmail(data.paypal_email || '');
    }
  };

  const fetchCars = async () => {
    const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (data) setCars(data);
  };

  useEffect(() => { fetchCars(); fetchSettings(); }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('site_settings').upsert({
      id: 'global',
      featured_price: Number(featuredPrice),
      western_union_info: westernUnionInfo.trim(),
      paypal_email: paypalEmail.trim()
    }, { onConflict: 'id' });

    if (!error) {
      showMessage('✅ تم حفظ وتحديث حسابات وأسعار الدفع الحية بنجاح', 'success');
      fetchSettings();
    } else {
      showMessage('❌ خطأ أثناء الحفظ: ' + error.message, 'error');
    }
  };

  const handleCarAction = async (carId: string, action: 'approve_featured' | 'remove_featured') => {
    const updateData = action === 'approve_featured' ? { is_featured: true, status: 'approved' } : { is_featured: false };
    const { error } = await supabase.from('cars').update(updateData).eq('id', carId);
    if (!error) { showMessage('✅ تم تحديث حالة الإعلان بنجاح', 'success'); fetchCars(); }
  };

  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', backgroundColor: 'white', padding: '15px', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 'bold' }}>🎛️ لوحة الإدارة والتحكم المالي</h1>
        <Link href="/dashboard/cars/new" style={{ textDecoration: 'none' }}><button style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>➕ نشر إعلان</button></Link>
      </div>

      {message.text && <div style={{ padding: '12px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>{message.text}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('cars')} style={{ padding: '10px', backgroundColor: activeTab === 'cars' ? '#2563eb' : 'white', color: activeTab === 'cars' ? 'white' : '#475569', borderRadius: '8px', fontWeight: 'bold' }}>🚗 الإعلانات</button>
        <button onClick={() => setActiveTab('featured_requests')} style={{ padding: '10px', backgroundColor: activeTab === 'featured_requests' ? '#eab308' : 'white', color: activeTab === 'featured_requests' ? 'white' : '#475569', borderRadius: '8px', fontWeight: 'bold' }}>⭐ طلبات التمييز</button>
        <button onClick={() => setActiveTab('settings')} style={{ padding: '10px', backgroundColor: activeTab === 'settings' ? '#2563eb' : 'white', color: activeTab === 'settings' ? 'white' : '#475569', borderRadius: '8px', fontWeight: 'bold' }}>⚙️ الإعدادات</button>
      </div>

      {activeTab === 'cars' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px' }}>
          {cars.map((car) => (
            <div key={car.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{car.brand} {car.model}</div>
                {car.is_featured && <button onClick={() => handleCarAction(car.id, 'remove_featured')} style={{ fontSize: '11px', color: '#dc2626', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', marginTop: '5px' }}>❌ إلغاء التميز</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'featured_requests' && (
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px' }}>
          {cars.filter(c => c.status === 'pending_featured').map((car) => (
            <div key={car.id} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '10px', marginBottom: '10px', backgroundColor: '#fffdf5' }}>
              <div style={{ fontWeight: 'bold' }}>{car.brand} {car.model} - {car.price} د.ك</div>
              <div style={{ backgroundColor: '#fef3c7', padding: '8px', borderRadius: '6px', fontSize: '12px', marginTop: '5px' }}>💳 الحوالة: {car.featured_payment_ref}</div>
              <button onClick={() => handleCarAction(car.id, 'approve_featured')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', marginTop: '8px', cursor: 'pointer' }}>⭐ موافقة وتثبيت كمميز</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px' }}>
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>تكلفة التمييز (د.ك)</label><input type="number" value={featuredPrice} onChange={e => setFeaturedPrice(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>بيانات ويسترن يونيون</label><textarea value={westernUnionInfo} onChange={e => setWesternUnionInfo(e.target.value)} required rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>حساب PayPal الرسمي</label><input type="email" value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>💾 حفظ وتثبيت الإعدادات المالية الحية</button>
          </form>
        </div>
      )}
    </div>
  );
}
