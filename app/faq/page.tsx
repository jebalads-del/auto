'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  // حالة للتحكم في السؤال المفتوح حالياً
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // مصفوفة تحتوي على الأسئلة والأجوبة المرقمة بناءً على المحتوى الذي أرسلته
  const faqs = [
    {
      question: '1. كيف أسجل بالموقع؟',
      answer: 'للتسجيل بالموقع اختر من القائمة "دخول" أسفل الصفحة "حساب جديد". سيتم إرسال كود OTP لتفعيل حسابك.'
    },
    {
      question: '2. كيف أتواصل مع البائع؟',
      answer: 'من الصفحة الرئيسية اختر الإعلان واضغط "التفاصيل" للإعلان. ستجد وسائل التواصل مع البائع أسفل الإعلان. ستجد أزرار التواصل بالإيميل، أو إذا أضاف هاتفه التواصل بالواتساب أو الاتصال.'
    },
    {
      question: '3. هل الموقع يحرص على مصداقية الإعلانات؟',
      answer: 'نعم، نولي اهتماماً شديداً بشروط نشر الإعلان، بموافقة البائع على شروط نشر الإعلان الذي يخصه، وأن لا يكون منقولاً من مكان آخر أو إعلانات وهمية، لنحمي المستخدمين من التحايل أو الإعلانات الوهمية.'
    },
    {
      question: '4. كيف أدخل على ملفي الشخصي وأعدل بياناتي؟',
      answer: 'يمكنك أولاً تسجيل حساب جديد وتفعيله عن طريق OTP الذي سيصل إلى بريدك الإلكتروني، ثم تسجيل الدخول ليتم دخولك للملف الشخصي. يمكنك تعديل الاسم أو رقم هاتفك، ويجب ضغط زر "حفظ". وستشاهد أي إعلانات قمت بنشرها.'
    },
    {
      question: '5. كيف أجعل إعلاني مميزاً ليصبح في الأعلى ويحصل على شارة "إعلان مميز"؟',
      answer: 'بالدخول إلى ملفك الشخصي ستجد إعلاناتك (إذا لم تقم بنشر إعلان بعد يجب أولاً نشر إعلان عادي مجاناً، بعد موافقة الإدارة سيظهر في ملفك الشخصي جميع إعلاناتك المنشورة). اضغط زر "طلب تمييز الإعلان" لأي إعلان ترغب به واتبع تعليمات الشاشة. الإعلانات المميزة مدفوعة بأسعار مخفضة لمدة شهر.'
    },
    {
      question: '6. كيف أجعل إعلان السيارة "مباعة" أو أحذف الإعلان؟',
      answer: 'تواصل مع الإدارة من خلال الزر "تواصل معنا" في أسفل الصفحة.'
    },
    {
      question: '7. هل هناك عروض خاصة لأصحاب مكاتب وشركات السيارات؟',
      answer: 'نعم، يمكنك التواصل مع إدارة الموقع.'
    },
    {
      question: '8. إذا كنت صاحب مكتب لبيع أو شراء السيارات، كيف أسجل حساباً في الموقع؟',
      answer: 'يمكنك تسجيل حساب عادي، ومن خلال عدد محدد من الإعلانات التي ستقوم بنشرها، ستحصل على امتيازات خاصة.'
    }
  ];

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
            marginBottom: '10px',
            textAlign: 'center',
            fontWeight: '900'
          }}>
            الأسئلة الشائعة ❓
          </h1>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px', fontSize: '16px' }}>
            اضغط على السؤال لعرض الإجابة
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                overflow: 'hidden',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}>
                {/* السؤال */}
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    backgroundColor: openIndex === index ? '#f8fafc' : 'white',
                    border: 'none',
                    borderBottom: openIndex === index ? '1px solid #e2e8f0' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: openIndex === index ? '#0f172a' : '#334155',
                    transition: 'background-color 0.2s ease',
                    textAlign: 'right'
                  }}
                >
                  <span>{faq.question}</span>
                  <span style={{ fontSize: '20px', color: '#f59e0b', minWidth: '20px', textAlign: 'center' }}>
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>

                {/* الإجابة (تظهر فقط عند الضغط) */}
                {openIndex === index && (
                  <div style={{
                    padding: '15px 20px',
                    backgroundColor: 'white',
                    color: '#475569',
                    lineHeight: '1.8',
                    fontSize: '15px',
                    borderTop: '1px solid #f8fafc'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '15px' }}>لم تجد إجابة لسؤالك؟</p>
            <a 
              href="mailto:admin@sayarty.store" 
              style={{
                display: 'inline-block',
                marginTop: '10px',
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              تواصل معنا 📧
            </a>
          </div>

        </div>
      </main>
    </div>
  );
}
