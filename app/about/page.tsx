'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{
      direction: 'rtl',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* الهيدر العلوي */}
      <header style={{
        backgroundColor: '#1e293b',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          ← العودة للرئيسية
        </Link>
      </header>

      <main style={{ padding: 'clamp(15px, 4vw, 30px)', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{
          backgroundColor: 'white',
          padding: 'clamp(20px, 5vw, 40px)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(24px, 6vw, 32px)', 
            color: '#0f172a', 
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: '900'
          }}>
            من نحن 🚗
          </h1>

          <div style={{ height: '4px', width: '60px', backgroundColor: '#f59e0b', margin: '0 auto 30px auto', borderRadius: '2px' }}></div>

          <p style={{ fontSize: 'clamp(15px, 3vw, 18px)', color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
            مرحباً بك في <strong>سيارتي ستور</strong>، منصة إعلانات بيع وشراء السيارات التي تقدم خدمات إعلانية مجانية للسيارات في الخليج. نحن مهتمون في إعلانات السيارات المستعملة أو الجديدة، ونقدم خدمات إعلانية مجانية فقط للجميع.
          </p>

          <div style={{
            backgroundColor: '#fffbeb',
            borderRight: '4px solid #f59e0b',
            padding: '15px 20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#92400e', fontWeight: 'bold' }}>
              ⚠️ تنبيه هام: نحن لا نتعامل في بيع أو شراء أو استئجار السيارات. وليست لنا أي تعاملات مع البائع أو المشتري في عملية بيع أو شراء السيارات، دورنا يقتصر على توفير المساحة الإعلانية.
            </p>
          </div>

          <h2 style={{ fontSize: '20px', color: '#0f172a', marginTop: '20px', marginBottom: '15px', fontWeight: 'bold' }}>
            ماذا نقدم لك؟
          </h2>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', color: '#334155' }}>
              <span style={{ fontSize: '20px' }}>✅</span> مساحة إعلانية مجانية تماماً لعرض سياراتك.
            </li>
            <li style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', color: '#334155' }}>
              <span style={{ fontSize: '20px' }}>✅</span> تصفح سهل وسريع لآلاف الإعلانات في الخليج.
            </li>
            <li style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', color: '#334155' }}>
              <span style={{ fontSize: '20px' }}>✅</span> تواصل مباشر بين البائع والمشتري بدون وسطاء.
            </li>
          </ul>

          <div style={{ marginTop: '40px', textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#166534' }}>
              رؤيتنا: أن نكون السوق الإعلاني الأكثر موثوقية وسهولة للسيارات في الخليج.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
