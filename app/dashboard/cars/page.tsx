'use client';

import { useEffect, useState } from 'react';

interface Car {
  id: number;
  marca: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  status: string;
  payment_method: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

export default function CarsManagement() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/admin/cars');
      const data = await response.json();
      if (data.success) {
        setCars(data.cars);
      } else {
        setError('فشل في جلب الإعلانات');
      }
    } catch {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleCarAction = async (carId: number, action: string) => {
    if (action === 'delete' && !confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/cars/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, action }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        fetchCars();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message);
        setTimeout(() => setError(''), 3000);
      }
    } catch {
      setError('حدث خطأ أثناء تنفيذ الإجراء');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; text: string }> = {
      pending: { bg: '#fef3c7', color: '#92400e', text: '⏳ قيد المراجعة' },
      approved: { bg: '#d1fae5', color: '#065f46', text: '✅ مقبول' },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: '❌ مرفوض' },
      sold: { bg: '#dbeafe', color: '#1e40af', text: '💰 مباع' },
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {style.text}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ direction: 'rtl', padding: '15px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>🚗 إدارة الإعلانات</h1>

      {error && (
        <div style={{ backgroundColor: '#fee', color: '#c33', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#efe', color: '#3c3', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
          ✅ {success}
        </div>
      )}

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: 'white' }}>
                <th style={{ padding: '10px', textAlign: 'right' }}>#</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>السيارة</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>السعر</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>المالك</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>الحالة</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>الدفع</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>التاريخ</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, index) => (
                <tr key={car.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}>{index + 1}</td>
                  <td style={{ padding: '10px' }}>
                    <div><strong>{car.marca}</strong> {car.model}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{car.year} | {car.color}</div>
                  </td>
                  <td style={{ padding: '10px' }}>${car.price.toLocaleString()}</td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>
                    <div>{car.user_name || 'مستخدم'}</div>
                    <div style={{ color: '#64748b' }}>{car.user_email}</div>
                  </td>
                  <td style={{ padding: '10px' }}>{getStatusBadge(car.status)}</td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>
                    {car.payment_method === 'western_union' ? '💵 ويسترن يونيون' : 
                     car.payment_method === 'paypal' ? '💳 باي بال' : '❌ لم يحدد'}
                  </td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{formatDate(car.created_at)}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {car.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleCarAction(car.id, 'approve')}
                            style={{ padding: '4px 10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            ✅ موافقة
                          </button>
                          <button
                            onClick={() => handleCarAction(car.id, 'reject')}
                            style={{ padding: '4px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                          >
                            ❌ رفض
                          </button>
                        </>
                      )}
                      {car.status === 'approved' && (
                        <button
                          onClick={() => handleCarAction(car.id, 'sold')}
                          style={{ padding: '4px 10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          💰 مباع
                        </button>
                      )}
                      <button
                        onClick={() => handleCarAction(car.id, 'delete')}
                        style={{ padding: '4px 10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cars.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              لا يوجد إعلانات حتى الآن
            </p>
          )}
        </div>
      )}
    </div>
  );
}
