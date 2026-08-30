'use client';

import React, { useEffect, useState, Suspense } from 'react';
import supabase from '@/lib/db'; // الاتصال المباشر والآمن بقاعدة بياناتك

export const dynamic = 'force-dynamic';

interface Car {
  id: string;
  brand?: string;
  model?: string;
  title?: string;
  price: number;
  status: string;
  created_at: string;
}

function AdminDashboardForm() {
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // جلب السيارات مباشرة من قلب قاعدة البيانات حياً وتخطي الـ API المكسور
  const fetchCars = async () => {
    try {
      setCarsLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCars(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleCarAction = async (carId: string, action: 'approve' | 'sell') => {
    if (!confirm('هل أنت متأكد من هذا الإجراء؟')) return;
    try {
      setCarsLoading(true);
      let newStatus = action === 'approve' ? 'مقبول' : 'مباع';

      const { error } = await supabase
        .from('cars')
        .update({ status: newStatus })
        .eq('id', carId);

      if (!error) {
        showMessage('تم تحديث حالة الإعلان بنجاح واكتمل التفعيل حياً', 'success');
        fetchCars();
      }
    } catch (err) {
      showMessage('خطأ في الاتصال بقاعدة البيانات', 'error');
    } finally {
      setCarsLoading(false);
    }
  };

  const handleCarDelete = async (carId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      setCarsLoading(true);
      const { error } = await supabase.from('cars').delete().eq('id', carId);
      if (!error) {
        showMessage('تم حذف الإعلان بنجاح نهائياً', 'success');
        setCars(prev => prev.filter(c => c.id !== carId));
      }
    } catch {
      showMessage('خطأ في شبكة الاتصال', 'error');
    } finally {
      setCarsLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', marginBottom: '25px', fontWeight: 'bold', color: '#1e293b' }}>🎛️ لوحة تحكم الإدارة العامة</h1>

      {message.text && (
        <div style={{ padding: '14px 20px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#dc2626', borderRadius: '8px', marginBottom: '20px' }}>
          {message.text}
        </div>
      )}

      <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {carsLoading ? <p style={{ padding: '20px', color: '#64748b' }}>جاري جلب البيانات حياً من سوبابيس...</p> : cars.length === 0 ? <p style={{ padding: '20px', color: '#64748b' }}>لا توجد إعلانات متوفرة حالياً (قاعدة البيانات نظيفة ومصفرة).</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <th style={{ padding: '14px', textAlign: 'right' }}>الإعلان</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>السعر</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>الحالة</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>التحكم</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px' }}>{car.title || `${car.brand} ${car.model}`}</td>
                  <td style={{ padding: '14px', color: '#16a34a' }}>{car.price} د.ك</td>
                  <td style={{ padding: '14px' }}>{car.status || 'قيد الانتظار'}</td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {car.status !== 'مقبول' && car.status !== 'مباع' && (
                        <button onClick={() => handleCarAction(car.id, 'approve')} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px' }}>موافقة</button>
                      )}
                      <button onClick={() => handleCarDelete(car.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px' }}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div>جاري تحميل الواجهة النظيفة...</div>}>
      <AdminDashboardForm />
    </Suspense>
  );
}
