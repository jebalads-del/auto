'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CAR_DATA: { [key: string]: string[] } = {
  "Toyota": ["Camry", "Land Cruiser", "Avalon", "Prado", "Hilux", "Corolla"],
  "Nissan": ["Patrol", "Maxima", "Altima", "Sunny", "Pathfinder", "X-Terra"],
  "Mercedes-Benz": ["S-Class", "E-Class", "C-Class", "G-Class", "GLE", "GLC"],
  "Lexus": ["LX570", "LS", "RX", "ES", "GX", "IS"],
  "Chevrolet": ["Tahoe", "Suburban", "Silverado", "Camaro", "Malibu", "Caprice"],
  "Ford": ["F-150", "Explorer", "Expedition", "Mustang", "Taurus", "Edge"],
  "BMW": ["7 Series", "5 Series", "3 Series", "X5", "X6", "X7"]
};

export default function NewCarPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [kilometers, setKilometers] = useState('');
  const [currency, setCurrency] = useState('KWD');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) {
      alert('🔒 عذراً، يجب عليك تسجيل الدخول أولاً لتتمكن من نشر إعلانك!');
      router.push('/login');
    } else {
      setIsAuth(true);
    }
    setCheckingAuth(false);
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 3); // 3 صور كحد أقصى لضمان خفة الطلب
      const base64Promises = filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const max_width = 300; // حجم مصغر واقتصادي فائق الخفة
              const scale = max_width / img.width;
              canvas.width = max_width;
              canvas.height = img.height * scale;
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              // تم تصحيح صياغة الاسم هنا بامتياز لإنهاء اعتراض التايب سكريبت
              resolve(canvas.toDataURL('image/jpeg', 0.4));
            };
            img.onerror = () => resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(base64Promises).then(results => {
        setUploadedImages(results);
      });
    }
  };

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !year || !price || !kilometers) {
      return alert('الرجاء تعبئة كافة الحقول الأساسية للسيارة');
    }

    try {
      setSubmitting(true);
      const userEmail = localStorage.getItem('userEmail') || '';
      const finalImagesString = uploadedImages.join(',');

      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand, model, year: parseInt(year, 10), price: parseFloat(price),
          kilometers: parseInt(kilometers, 10), currency, color, description,
          images: finalImagesString, user_email: userEmail
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('🎉 تم نشر إعلانك بمعرض الصور الحية بنجاح باهر وجاري مراجعته الآن!');
        router.push('/profile');
      } else {
        alert(data.message || 'عذراً، فشل السيرفر في حفظ الإعلان الجديد');
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
          <form onSubmit={handleSubmitAd}>
            
            <div style={styles.formGridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>🚗 اختر ماركة السيارة</label>
                <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(''); }} style={styles.selectField}>
                  <option value="">-- اضغط واختر الماركة --</option>
                  {Object.keys(CAR_DATA).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>🏷️ اختر طراز السيارة (الموديل)</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} style={brand ? styles.selectField : styles.disabledSelectField}>
                  <option value="">-- اختر الطراز المتاح --</option>
                  {brand && CAR_DATA[brand].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.formGridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>📅 سنة الصنع</label>
                <input type="number" placeholder="مثال: 2024" value={year} onChange={(e) => setYear(e.target.value)} style={styles.inputField} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>📟 المسافة المقطوعة (كم)</label>
                <input type="number" placeholder="مثال: 50000" value={kilometers} onChange={(e) => setKilometers(e.target.value)} style={styles.inputField} />
              </div>
            </div>

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

            <div style={styles.formGridTwo}>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>🎨 اللون الخارجي</label>
                <input type="text" placeholder="مثال: أبيض, أسود ميتاليك" value={color} onChange={(e) => setColor(e.target.value)} style={styles.inputField} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.labelField}>📸 تحميل صور السيارة من الألبوم (حتى 3 صور حية)</label>
                <label htmlFor="file-upload" style={styles.fileUploadLabel}>📁 اضغط هنا لاختيار صور السيارة</label>
                <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {uploadedImages.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', fontWeight: 'bold' }}>
                    ✅ تم تجهيز ونمذجة ({uploadedImages.length}) صور فائقة الخفة للنشر
                  </div>
                )}
              </div>
            </div>

            <div style={styles.inputGroupFull}>
              <label style={styles.labelField}>📝 تفاصيل ووصف إضافي للسيارة</label>
              <textarea placeholder="اكتب حالة السيارة، المواصفات، الفحص..." value={description} onChange={(e) => setDescription(e.target.value)} style={styles.textareaField}></textarea>
            </div>

            <button type="submit" disabled={submitting} style={styles.submitButton}>
              {submitting ? 'جاري النشر العبقري فائق السعة...' : '🚀 انشر الإعلان بمعرض الصور الآن'}
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
  formGridTwo: { display: 'flex', flexWrap: 'wrap' as const, gap: '15px', marginBottom: '15px' },
  inputGroup: { flex: '1 1 280px', display: 'flex', flexDirection: 'column' as const, minWidth: '250px' },
  inputGroupFull: { display: 'flex', flexDirection: 'column' as const, marginBottom: '20px' },
  labelField: { fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' },
  inputField: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const },
  selectField: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' as const },
  disabledSelectField: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#edf2f7', color: '#a0aec0', fontSize: '14px', cursor: 'not-allowed', boxSizing: 'border-box' as const },
  textareaField: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'vertical' as const, boxSizing: 'border-box' as const },
  fileUploadLabel: { display: 'block', padding: '12px', backgroundColor: '#e2e8f0', color: '#2563eb', border: '2px dashed #2563eb', borderRadius: '10px', textAlign: 'center' as const, fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  submitButton: { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' },
  loadingContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' },
  spinner: { width: '35px', height: '35px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%' }
};
