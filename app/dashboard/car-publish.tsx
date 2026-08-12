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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handlePublishSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('brand', brand);
      formData.append('model', model);
      formData.append('year', year);
      formData.append('color', color);
      formData.append('price', price);
      formData.append('notes', notes);
      formData.append('status', 'pending');

      // إرسال ملف الصورة الفردي المباشر والمتوافق مع السيرفر الخلفي
      if (selectedImage) {
        formData.append('images', selectedImage);
      }

      const response = await fetch('/api/cars', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل الحفظ في السيرفر');
      }

      alert(`✅ تم إرسال إعلان السيارة للمراجعة بنجاح وسيظهر في قسم الانتظار لإدارته!`);

      setBrand('');
      setModel('');
      setYear('');
      setColor('');
      setPrice('');
      setNotes('');
      setSelectedImage(null);
    } catch (error) {
      console.error(error);
      alert('❌ عذراً، فشل إرسال الإعلان للسيرفر. يرجى التحقق من الاتصال والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 text-right" dir="rtl">
      <form onSubmit={handlePublishSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الماركة الأساسية:</label>
          <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(''); }} required className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none">
            <option value="">-- اختر الماركة --</option>
            {Object.keys(carBrandsAndModels).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الموديل أو الطراز:</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} required disabled={!brand} className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition disabled:opacity-50 outline-none">
            <option value="">-- اختر الموديل --</option>
            {brand && carBrandsAndModels[brand].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع:</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} required className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none">
              <option value="">-- السنة --</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اللون الأساسي:</label>
            <select value={color} onChange={(e) => setColor(e.target.value)} required className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none">
              <option value="">-- اللون --</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">السعر المتوقع (إدخال يدوي):</label>
          <input type="number" placeholder="مثال: 17000" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية ومواصفات:</label>
          <textarea rows={3} placeholder="اكتب تفاصيل حالة السيارة، الصبغ، الفحص..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">صورة السيارة المرفقة:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required className="w-full text-xs text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <p className="text-[11px] text-gray-400 mt-1">{selectedImage ? `✓ تم اختيار ملف: ${selectedImage.name}` : "يرجى اختيار صورة للسيارة مجاناً لرفعها."}</p>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-50 mt-2">
          {loading ? 'جاري رفع الملف وحفظ البيانات...' : '🚀 إرسال السيارة للمراجعة الآن'}
        </button>
      </form>
    </div>
  );
}
