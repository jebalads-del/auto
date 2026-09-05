"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  is_featured: boolean;
  featured_status: string | null;
}

export default function AdminDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cars');
      if (res.ok) {
        const data = await res.json();
        setCars(data.cars || data || []);
      }
    } catch (error) {
      console.error("Error loading ads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);
  const handleApproveFeatured = async (id: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: true, featured_status: 'approved' })
      });
      if (res.ok) {
        alert('✅ تم اعتماد الدفع وتفعيل الإعلان كمميز بنجاح!');
        await fetchAdminData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCar = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/cars/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCars(prev => prev.filter(c => c.id !== id));
        alert('✅ تم حذف الإعلان بنجاح');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={{ direction: 'rtl', padding: '20px', textAlign: 'center' }}><p>جاري تحميل البيانات الإدارية...</p></div>;

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>🛠️ إدارة طلبات التميز (المشرف)</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>مراجعة وتفعيل الإعلانات المدفوعة</p>
        </div>
        <Link href="/dashboard" style={{ backgroundColor: '#1e293b', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>⬅️ لوحة التحكم العامة</Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 15px' }}>الإعلان</th>
              <th style={{ padding: '12px 15px' }}>السعر</th>
              <th style={{ padding: '12px 15px' }}>حالة الطلب المالي</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{car.brand} {car.model} ({car.year})</td>
                <td style={{ padding: '12px 15px', color: '#059669', fontWeight: 'bold' }}>{car.price} KWD</td>
                <td style={{ padding: '12px 15px' }}>
                  {car.is_featured ? (
                    <span style={{ color: '#d97706', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>🌟 مميز نشط</span>
                  ) : car.featured_status === 'pending' ? (
                    <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>⏳ قيد المراجعة</span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '12px' }}>عادي</span>
                  )}
                </td>
                <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                  {car.featured_status === 'pending' && !car.is_featured ? (
                    <button disabled={actionLoading === car.id} onClick={() => handleApproveFeatured(car.id)} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>✅ تفعيل التميز</button>
                  ) : (
                    <button disabled={actionLoading === car.id} onClick={() => handleDeleteCar(car.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>حذف</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
