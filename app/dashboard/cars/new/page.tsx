'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCarPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // المتغيرات الحركية لجمع بيانات السيارة
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [currency, setCurrency] = useState('KWD');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // فحص حماية الصفحة لمنع غير المسجلين من إرسال إعلانات مجهولة
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) {
      alert('🔒 عذراً، يجب عليك تسجيل الدخول أولاً لتتمكن من نشر إعلانك!');
      router.push('/login');
    } else {
      setIsAuth(true);
    }
    setCheckingAuth(false);
  }, [router]);

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !year || !price || !kilometers) {
      return alert('الرجاء تعبئة كافة الحقول الأساسية للسيارة');
    }

    try {
      setSubmitting(true);
      const userEmail = localStorage.getItem('userEmail') || '';
      
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand, model, year: parseInt(year, 10), price: parseFloat(price),
          kilometers: parseInt(kilometers, 10), currency, color, description,
          images, user_email: userEmail, status: 'pending' // ترسل للمراجعة حياً في لوحة الإدارة
        })
      });

      if (res.ok) {
        alert('تم إرسال إعلانك بنجاح وجاري مراجعته من قبل الإدارة! 🎉');
        router.push('/profile');
      } else {
        alert('فشل السيرفر في حفظ الإعلان الجديد');
      }
    } catch {
      alert('خطأ في شبكة الاتصال أثناء نشر الإعلان');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;
  if (!isAuth) return null;
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>➕ إضافة إعلان سيارة جديد</h1>
          <Link href="/" style={styles.headerLink}>🏠 الرئيسية</Link>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit Ad}>
            
            {/* ماركة السيارة وطرازها */}
            <div style={styles.formGridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>🚗 ماركة السيارة</label>
                <input type="text" placeholder="مثال: Toyota, Mercedes" value={brand} onChange={(e) => setBrand(e.target.value)} style={styles.inputField} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>🏷️ الطراز (الموديل)</label>
                <input type="text" placeholder="مثال: Camry, Land Cruiser" value={model} onChange={(e) => setModel(e.target.value)} style={styles.inputField} />
              </div>
            </div>

            {/* سنة الصنع والمسافة المقطوعة */}
            <div style={styles.formGridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>📅 سنة الصنع (الموديل)</label>
                <input type="number" placeholder="مثال: 2024" value={year} onChange={(e) => setYear(e.target.value)} style={styles.inputField} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>📟 المسافة المقطوعة (كم)</label>
                <input type="number" placeholder="مثال: 50000" value={kilometers} onChange={(e) => setKilometers(e.target.value)} style={styles.inputField} />
              </div>
            </div>

            {/* السعر المطلوب والعملة */}
            <div style={styles.formGridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>💰 السعر المطلوب</label>
                <input type="number" placeholder="أدخل السعر هنا" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.inputField} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>💵 العملة</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={styles.selectField}>
                  <option value="KWD">دينار كويتي</option>
                  <option value="SAR">ريال سعودي</option>
                  <option value="AED">درهم إماراتي</option>
                  <option value="QAR">ريال قطري</option>
                </select>
              </div>
            </div>

            {/* اللون والروابط */}
            <div style={styles.formGridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>🎨 اللون الخارجي</label>
                <input type="text" placeholder="مثال: أبيض, أسود ميتاليك" value={color} onChange={(e) => setColor(e.target.value)} style={styles.inputField} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>🖼️ رابط صورة السيارة</label>
                <input type="text" placeholder="ضع رابط الصورة المباشر هنا" value={images} onChange={(e) => setImages(e.target.value)} style={styles.inputField} />
              </div>
            </div>

            {/* تفاصيل السيارة ووصفها */}
            <div style={styles.inputGroupFull}>
              <label style={styles.labelField}>📝 تفاصيل ووصف إضافي للسيارة</label>
              <textarea placeholder="اكتب حالة السيارة، المواصفات، الفحص..." value={description} onChange={(e) => setDescription(e.target.value)} style={styles.textareaField}></textarea>
            </div>

            <button type="submit" disabled={submitting} style={styles.submitButton}>
              {submitting ? 'جاري نشر إعلانك الحركي...' : '🚀 انشر الإعلان الآن'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', direction: 'rtl' as const },
  header: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '15px 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto' },
  headerTitle: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
  headerLink: { fontSize: '13px', color: '#cbd5e1', textDecoration: 'none' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '20px 12px' },
  formCard: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
  
  // تنسيق مصفوفة ذكية تتحول تلقائياً لعمود واحد على الهواتف لمنع اللخبطة وخروج الحقول
  formGridTwo: { display: 'flex', flexWrap: 'wrap' as const, gap: '15px', marginBottom: '15px' },
  inputGroup: { flex: '1 1 280px', display: 'flex', flexDirection: 'column' as const, minWidth: '250px' },
  inputGroupFull: { display: 'flex', flexDirection: 'column' as const, marginBottom: '20px' },
  
  labelField: { fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' },
  inputField: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const },
  selectField: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' as const },
  textareaField: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'vertical' as const, boxSizing: 'border-box' as const },
  
  submitButton: { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' },
  loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '35px', height: '35px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%' }
};
