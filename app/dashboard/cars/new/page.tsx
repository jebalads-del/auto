"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";

const brands = [
  { id: "1", name: "بي إم دبليو", nameAr: "بي إم دبليو" },
  { id: "2", name: "مرسيدس", nameAr: "مرسيدس" },
  { id: "3", name: "تويوتا", nameAr: "تويوتا" },
  { id: "4", name: "هوندا", nameAr: "هوندا" }
];

const modelsByBrand: any = {
  "1": [{ id: "1", name: "X5" }, { id: "2", name: "Series 3" }],
  "2": [{ id: "3", name: "C-Class" }, { id: "4", name: "E-Class" }],
  "3": [{ id: "5", name: "Camry" }, { id: "6", name: "Corolla" }],
  "4": [{ id: "7", name: "Civic" }, { id: "8", name: "Accord" }]
};

const currencies = [
  { id: "1", name: "دينار كويتي" },
  { id: "2", name: "ريال سعودي" },
  { id: "3", name: "درهم إماراتي" },
  { id: "4", name: "دولار أمريكي" }
];

const colors = [
  { id: "1", name: "أبيض" },
  { id: "2", name: "أسود" },
  { id: "3", name: "فضي" },
  { id: "4", name: "رمادي" }
];

export default function NewCarPage() {
  const sessionContext = useSession();
  const session = sessionContext ? sessionContext.data : null;
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("دينار كويتي");
  const [year, setYear] = useState("");
  const [kilometers, setKilometers] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [imagePreviews, setImagePreviews] = useState<any[]>([]);

  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      toast.error("الحد الأقصى 4 صور فقط");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((file: any) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!brand || !model || !price || !year || !kilometers || !color) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (!session?.user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    setLoading(true);
    try {
      const imageUrls: string[] = [];
      
      for (const file of images) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const uploadRes = await fetch("/api/cars/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const blobData = await uploadRes.json();
            const finalUrl = blobData.url || blobData.secure_url || blobData.blob?.url;
            if (finalUrl) {
              imageUrls.push(finalUrl);
            }
          }
        } catch (uploadError) {
          console.error("Upload Error: ", uploadError);
        }
      }

      const imageUrlsString = JSON.stringify(imageUrls);

      const carData = {
        brand,
        model,
        price: parseFloat(price),
        ad_type: "بيع",
        ad_position: "عادي",
        year: parseInt(year),
        kilometers: parseInt(kilometers),
        currency,
        color,
        description,
        user_id: (session.user as any).id || "",
        user_email: session.user.email,
        images: imageUrlsString
      };

      const response = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("تم نشر الإعلان بنجاح وينتظر موافقة المسؤول");
        router.push("/dashboard/cars");
      } else {
        toast.error(data.message || "فشل نشر الإعلان");
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">إضافة إعلان سيارة جديدة</h2>
          <p className="mt-2 text-sm text-gray-500">يرجى ملء تفاصيل السيارة بدقة لجذب المشترين</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الماركة *</label>
            <select 
              value={brand} 
              onChange={(e: any) => { setBrand(e.target.value); setModel(""); }} 
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
            >
              <option value="">اختر الماركة</option>
              {brands.map((b) => <option key={b.id} value={b.nameAr}>{b.nameAr}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الموديل *</label>
            <select 
              value={model} 
              onChange={(e: any) => setModel(e.target.value)} 
              disabled={!brand} 
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base disabled:opacity-50 disabled:bg-gray-100"
            >
              <option value="">اختر الموديل</option>
              {brand && modelsByBrand[brands.find((b: any) => b.nameAr === brand)?.id || ""]?.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">السعر *</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base" 
                placeholder="مثال: 5000" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">العملة *</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              >
                {currencies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">سنة الصنع *</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base" 
                placeholder="مثال: 2021" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الممشي (كم) *</label>
              <input 
                type="number" 
                value={kilometers} 
                onChange={(e) => setKilometers(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base" 
                placeholder="مثال: 135000" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اللون *</label>
            <select 
              value={color} 
              onChange={(e: any) => setColor(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
            >
              <option value="">اختر اللون</option>
              {colors.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50/20 hover:bg-blue-50/40 transition-all">
            <label className="block text-sm font-semibold text-gray-700 mb-2">صور السيارة (حد أقصى 4)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-500 font-semibold">اضغط لاختيار ملفات الصور من جهازك</p>
                  <p className="text-xs text-gray-400">PNG, JPG, JPEG (حد أقصى 4 صور)</p>
                </div>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-100 group shadow-sm">
                    <img src={src} alt="preview" className="object-cover w-full h-full" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)} 
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 font-medium">{images.length} من 4 صور تم اختيارها</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">وصف الإعلان</label>
            <textarea 
              value={description} 
              onChange={(e: any) => setDescription(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base h-28 resize-none" 
              placeholder="اكتب حالة السيارة والمميزات الإضافية هنا..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-base shadow-md hover:shadow-lg transition-all disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري رفع الصور ونشر الإعلان...
              </>
            ) : "نشر الإعلان"}
          </button>
        </form>
      </div>
    </div>
  );
}
