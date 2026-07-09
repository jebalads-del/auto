'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DashboardPage() {
  const [isLoggedIn] = useState(true)

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>يجب تسجيل الدخول أولاً</h1>
        <Link href="/login">اذهب لتسجيل الدخول</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #0070f3', paddingBottom: '20px' }}>
        <h1>📊 لوحة التحكم</h1>
        <nav>
          <Link href="/" style={{ marginLeft: '20px', color: '#0070f3', fontWeight: 'bold' }}>الرئيسية</Link>
          <Link href="/login" style={{ marginLeft: '20px', color: '#e74c3c', fontWeight: 'bold' }}>تسجيل خروج</Link>
        </nav>
      </header>

      <div style={{ marginBottom: '40px' }}>
        <h2>الإحصائيات</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0f8ff' }}>
            <h3 style={{ color: '#0070f3', marginBottom: '10px' }}>إجمالي الإعلانات</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#0070f3', margin: 0 }}>12</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0fff0' }}>
            <h3 style={{ color: '#27ae60', marginBottom: '10px' }}>المستخدمون النشطون</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>45</p>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff8f0' }}>
            <h3 style={{ color: '#e67e22', marginBottom: '10px' }}>إجمالي المبيعات</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#e67e22', margin: 0 }}>2.5M</p>
          </div>
        </div>
      </div>

      <div>
        <h2>الإعلانات الحديثة</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الاسم</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>السعر</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الحالة</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>BMW 2020</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>150,000 ر.س</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', color: '#27ae60', fontWeight: 'bold' }}>✓ نشط</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}><button style={{ backgroundColor: '#0070f3', color: 'white', padding: '5px 10px' }}>تعديل</button></td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Toyota Corolla</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>80,000 ر.س</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', color: '#27ae60', fontWeight: 'bold' }}>✓ نشط</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}><button style={{ backgroundColor: '#0070f3', color: 'white', padding: '5px 10px' }}>تعديل</button></td>
            </tr>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Mercedes C300</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>200,000 ر.س</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd', color: '#e67e22', fontWeight: 'bold' }}>⏳ قيد المراجعة</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}><button style={{ backgroundColor: '#e67e22', color: 'white', padding: '5px 10px' }}>مراجعة</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}