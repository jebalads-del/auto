'use client';
import { useState, ChangeEvent, FormEvent } from 'react';

const carBrandsAndModels: Record<string, string[]> = {
  "تويوتا": ["كامري", "كورولا", "لاندكروزر", "يارس", "راف 4"],
  "مرسيدس": ["C-Class", "E-Class", "S-Class", "G-Class", "GLE"],
  "بي أم دبليو": ["Series 3", "Series 5", "Series 7", "X5", "X7"],
  "هيونداي": ["إلنترا", "سوناتا", "توسان", "أكسنت", "سانتا في"],
  "نيسان": ["باترول", "ألتيما", "صني", "اكس تريل", "باثفايندر"]
};

const years = Array.from({ length: 2027 - 2015 + 1 }, (_, i) => (2027 - i).toString());
const colors = ["أبيض", "أسود", "فضي", "رمادي", "أزرق", "أحمر", "أحمر غامق", "ذهبي"];

export default function CarPublish() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handlePublishSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError('');

    try {
      // 1. First create the car WITHOUT images
      const carResponse = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          year,
          color,
          price: Number(price),
          kilometers: 0,
          description: notes,
          currency: '$',
          images: '', // Empty initially
          status: 'pending'
        }),
      });

      if (!carResponse.ok) {
        throw new Error('Failed to create car');
      }

      const carData = await carResponse.json();
      const carId = carData.carId;

      // 2. Upload image with carId
      if (imageFile && carId) {
        try {
          const imgFormData = new FormData();
          imgFormData.append('file', imageFile);
          imgFormData.append('carId', String(carId)); // Add carId to form data

          const uploadRes = await fetch('/api/cars/upload', {
            method: 'POST',
            body: imgFormData,
          });

          if (!uploadRes.ok) {
            console.warn('Image upload failed, but car was created');
            setUploadError('⚠️ السيارة تم إنشاؤها لكن حدث خطأ في رفع الصورة');
          }
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr);
          setUploadError('⚠️ السيارة تم إنشاؤها لكن حدث خطأ في رفع الصورة');
        }
      }

      alert(`✅ تم إرسال إعلان السيارة للمراجعة بنجاح وسيظهر في لوحة التحكم لإدارته!`);

      // Reset form
      setBrand('');
      setModel('');
      setYear('');
      setColor('');
      setPrice('');
      setNotes('');
      setImageFile(null);
    } catch (error) {
      console.error(error);
      setUploadError('❌ فشل إرسال الإعلان. يرجى التأكد من ملء الحقول والمحاولة مرة أخرى.');
      alert('❌ فشل إرسال الإعلان. يرجى التأكد من ملء الحقول والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 text-right" dir="rtl">
      <form onSubmit={handlePublishSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الماركة الأساسية:</label>
          <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(''); }} required className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none">
            <option value="">-- اختر الماركة --</option>
            {Object.keys(carBrandsAndModels).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الموديل أو الطراز:</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} required disabled={!brand} className="w-full p-2 border rounded-lg text-sm bg-gray-50 disabled:opacity-50 outline-none">
            <option value="">-- اختر الموديل --</option>
            {brand && carBrandsAndModels[brand].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع:</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} required className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none">
              <option value="">-- السنة --</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اللون الأساسي:</label>
            <select value={color} onChange={(e) => setColor(e.target.value)} required className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none">
              <option value="">-- اللون --</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">السعر المتوقع ($):</label>
          <input type="number" placeholder="مثال: 17000" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية ومواصفات:</label>
          <textarea rows={3} placeholder="اكتب تفاصيل حالة السيارة، الصبغ، الفحص..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-gray-50 outline-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">صورة السيارة المرفقة:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required className="w-full text-xs text-gray-500" />
        </div>

        {uploadError && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">{uploadError}</div>
        )}

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 disabled:opacity-50 mt-2">
          {loading ? 'جاري معالجة ورفع الصورة الحقيقية...' : '🚀 إرسال السيارة للمراجعة الآن'}
        </button>
      </form>
    </div>
  );
}
