'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    receiverName: 'احمد',
    country: 'الكويت',
    phone: '555555',
    city: 'الكويت',
    paypalEmail: 'mara7b@yahoo.com',
    merchantId: 'dixon316',
    singleFeaturedPrice: '10', // تسعيرة الخدمة الفردية الجديدة المميزة
    featuredDuration: '30'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('💾 تم حفظ تسعيرة خدمة تمييز الإعلانات وبيانات الاستلام الفورية!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
        <Link href="/dashboard" style={{ display: 'inline-block', marginBottom: '15px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>← العودة للوحة التحكم</Link>
        <h1 style={{ fontSize: '20px', marginBottom: '10px', color: '#1e293b' }}>⚙️ إعدادات الحساب وتسعيرة الخدمات</h1>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>تخصيص بيانات الدفع التي تظهر للمستخدمين عند طلب خدمة التميز للإعلانات الفردية</p>
        
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>✅ {success}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px' }}>
            <legend style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669', padding: '0 10px' }}>💵 قنوات استلام الأموال (ويسترن يونيون)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>اسم المستلم الحقيقي:</label><input type="text" value={settings.receiverName} onChange={(e) => setSettings({...settings, receiverName: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>الدولة:</label><input type="text" value={settings.country} onChange={(e) => setSettings({...settings, country: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>المدينة:</label><input type="text" value={settings.city} onChange={(e) => setSettings({...settings, city: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>رقم الهاتف للتواصل:</label><input type="text" value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} style={inputStyle} /></div>
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px' }}>
            <legend style={{ fontSize: '14px', fontWeight: 'bold', color: '#d97706', padding: '0 10px' }}>💳 قنوات استلام الأموال (حساب PayPal)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>البريد الإلكتروني للـ PayPal:</label><input type="email" value={settings.paypalEmail} onChange={(e) => setSettings({...settings, paypalEmail: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>معرف التاجر:</label><input type="text" value={settings.merchantId} onChange={(e) => setSettings({...settings, merchantId: e.target.value})} style={inputStyle} /></div>
            </div>
          </fieldset>

          <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px' }}>
            <legend style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b', padding: '0 10px' }}>👑 تسعيرة خطة "تمييز إعلان منفرد"</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>سعر الخدمة لكل إعلان (د.ك):</label><input type="number" value={settings.singleFeaturedPrice} onChange={(e) => setSettings({...settings, singleFeaturedPrice: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>مدة بقاء التميز (أيام):</label><input type="number" value={settings.featuredDuration} onChange={(e) => setSettings({...settings, featuredDuration: e.target.value})} style={inputStyle} /></div>
            </div>
          </fieldset>

          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '10px' }}>
            💾 حفظ تسعيرة خدمة التميز
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const };
