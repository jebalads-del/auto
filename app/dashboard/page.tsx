'use client'

import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>لوحة التحكم</h1>
      <nav style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ marginRight: '20px', textDecoration: 'none', color: '#0070f3' }}>
          العودة للمنزل
        </Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>إجمالي الإعلانات</h3>
          <p style={{ fontSize: '32px', color: '#0070f3' }}>12</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>المستخدمون</h3>
          <p style={{ fontSize: '32px', color: '#0070f3' }}>45</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>المبيعات</h3>
          <p style={{ fontSize: '32px', color: '#0070f3' }}>2.5M</p>
        </div>
      </div>

      <h2 style={{ marginTop: '40px' }}>الإعلانات الحديثة</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>الاسم</th>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>السعر</th>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>BMW 2020</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>150,000 ر.س</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#27ae60' }}>✓ نشط</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Toyota Corolla</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>80,000 ر.س</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#27ae60' }}>✓ نشط</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
