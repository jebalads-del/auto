'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [cars, setCars] = useState([]);

  const fetchData = async () => {
    try {
      const resUsers = await fetch('/api/admin/users').then(r => r.json());
      if (resUsers.success) setUsers(resUsers.users || []);
      
      const resReqs = await fetch('/api/admin/featured-requests').then(r => r.json()).catch(() => ({ requests: [] }));
      setRequests(resReqs.requests || []);

      const resCars = await fetch('/api/cars?t=' + Date.now()).then(r => r.json());
      if (resCars.success) setCars(resCars.cars || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    const isAdmin = Cookies.get('isAdmin') || localStorage.getItem('isAdmin');
    if (!isAdmin) { router.push('/login'); return; }
    fetchData();
  }, []);

  const handleFeaturedAction = async (requestId: number, carId: number, action: 'approve' | 'reject') => {
    if (!confirm(`هل أنت متأكد من إجراء الـ ${action === 'approve' ? 'موافقة' : 'رفض'}؟`)) return;
    try {
      await fetch('/api/admin/featured-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, carId, action })
      });
      alert('⚙️ تم تنفيذ الإجراء وتحديث الإعلان بنجاح!');
      fetchData();
    } catch (e) { alert('❌ فشل الإرسال'); }
  };

  const handleMarkAsSold = async (carId: number) => {
    if (!confirm('هل تريد تفعيل حالة "مباعة" لهذه السيارة؟')) return;
    try {
      await fetch('/api/admin/mark-sold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId })
      });
      alert('🟢 تم تحديث الإعلان كسيارة مباعة بنجاح!');
      fetchData();
    } catch (e) { alert('❌ فشل تحديث الحالة'); }
  };

  if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>⏳ جاري تحميل لوحة الإدارة الشاملة...</div>;
  return (
    <div style={{direction: 'rtl', padding: '15px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif'}}>
      <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center'}}>⚙️ لوحة تحكم المدير المصلحة</h1>
      
      {/* 1. قسم طلبات تمييز الإعلانات */}
      <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '15px', marginBottom: '20px'}}>
        <h2 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#be185d'}}>⭐ طلبات تمييز الإعلانات قيد الانتظار ({requests.length})</h2>
        {requests.length === 0 ? <p style={{color: '#64748b', fontSize: '13px'}}>لا توجد طلبات تمييز معلقة حالياً.</p> : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
              <thead>
                <tr style={{background: '#f8fafc'}}><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>رقم السيارة</th><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>وسيلة الدفع</th><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>المبلغ</th><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>الإجراءات</th></tr>
              </thead>
              <tbody>
                {requests.map((req: any) => (
                  <tr key={req.id} style={{textAlign: 'center'}}>
                    <td style={{padding: '8px', border: '1px solid #e2e8f0'}}><strong>#{req.car_id}</strong></td>
                    <td style={{padding: '8px', border: '1px solid #e2e8f0', color: req.payment_method === 'paypal' ? '#1e3a8a' : '#15803d'}}>{req.payment_method === 'paypal' ? 'PayPal 💰' : 'Western 🏦'}</td>
                    <td style={{padding: '8px', border: '1px solid #e2e8f0'}}>{req.amount} د.ك</td>
                    <td style={{padding: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '5px', justifyContent: 'center'}}>
                      <button onClick={() => handleFeaturedAction(req.id, req.car_id, 'approve')} style={{backgroundColor: '#059669', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}}>🟢 موافقة</button>
                      <button onClick={() => handleFeaturedAction(req.id, req.car_id, 'reject')} style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px'}}>🔴 رفض</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. قسم التحكم بالسيارات واستعادة زر السيارة مباعة */}
      <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '15px', marginBottom: '20px'}}>
        <h2 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#1e3a8a'}}>🚗 إدارة إعلانات السيارات الحالية ({cars.length})</h2>
        {cars.length === 0 ? <p style={{color: '#64748b', fontSize: '13px'}}>لا توجد سيارات معروضة بالمعرض.</p> : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
              <thead>
                <tr style={{background: '#f8fafc'}}><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>السيارة</th><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>السعر</th><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>الحالة الحاليّة</th><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>التحكم بالأدمن</th></tr>
              </thead>
              <tbody>
                {cars.map((car: any) => (
                  <tr key={car.id} style={{textAlign: 'center'}}>
                    <td style={{padding: '8px', border: '1px solid #e2e8f0'}}>{car.brand} {car.model}</td>
                    <td style={{padding: '8px', border: '1px solid #e2e8f0'}}>{Number(car.price).toLocaleString()} {car.currency || 'د.ك'}</td>
                    <td style={{padding: '8px', border: '1px solid #e2e8f0'}}>
                      <span style={{fontSize: '11px', fontWeight: 'bold', color: car.is_featured ? '#be185d' : car.status === 'sold' ? '#ef4444' : '#059669'}}>
                        {car.is_featured ? '⭐ مميز من الإدارة' : car.status === 'sold' ? '🔴 تم بيعها' : '🟢 معروضة'}
                      </span>
                    </td>
                    <td style={{padding: '8px', border: '1px solid #e2e8f0'}}>
                      {car.status !== 'sold' ? (
                        <button onClick={() => handleMarkAsSold(car.id)} style={{backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}>🤝 تعيين السيارة كمباعة</button>
                      ) : <span style={{color: '#94a3b8', fontSize: '12px'}}>تم إغلاق البيع ✓</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. جدول المستخدمين الأصلي والمحفوظ بالكامل */}
      <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '15px'}}>
        <h2 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>👥 مستخدمين نظام السيارة ({users.length})</h2>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
            <thead>
              <tr style={{background: '#f8fafc'}}><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>الاسم</th><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>البريد</th><th style={{padding: '8px', border: '1px solid #e2e8f0'}}>الحالة</th></tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} style={{textAlign: 'center'}}>
                  <td style={{padding: '8px', border: '1px solid #e2e8f0'}}>{user.name || '—'}</td>
                  <td style={{padding: '8px', border: '1px solid #e2e8f0'}}>{user.email || '—'}</td>
                  <td style={{padding: '8px', border: '1px solid #e2e8f0'}}>
                    {user.is_premium ? '⭐ Premium' : 'عادي'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
