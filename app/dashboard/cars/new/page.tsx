"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export const dynamic = "force-dynamic";

interface Brand { id: string; name: string; nameAr: string; }
interface Model { id: string; name: string; }

const brands: Brand[] = [
  { id: "1", name: "بي إم دبليو", nameAr: "بي إم دبليو" },
  { id: "2", name: "مرسيدس", nameAr: "مرسيدس" },
  { id: "3", name: "تويوتا", nameAr: "تويوتا" },
  { id: "4", name: "هوندا", nameAr: "هوندا" }
];

const modelsByBrand: Record<string, Model[]> = {
  "1": [{ id: "1", name: "X5" }, { id: "2", name: "Series 3" }],
  "2": [{ id: "3", name: "C-Class" }, { id: "4", name: "E-Class" }],
  "3": [{ id: "5", name: "Camry" }, { id: "6", name: "Corolla" }],
  "4": [{ id: "7", name: "Civic" }, { id: "8", name: "Accord" }]
};

export default function NewCarPage() {
  const { data: session }: any = useSession();
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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      toast.error("الحد الأقصى 4 صور فقط");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
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
        images: JSON.stringify(imageUrls)
      };

      const response = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });

      if (response.ok) {
        toast.success("تم نشر الإعلان بنجاح");
        router.push("/dashboard/cars");
      } else {
        const data = await response.json();
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
              onChange={(e) => { setBrand(e.target.value); setModel(""); }} 
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
              onChange={(e) => setModel(e.target.value)} 
              disabled={!brand} 
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base disabled:opacity-50 disabled:bg-gray-100"
            >
              <option value="">اختر الموديل</option>
              {brand && modelsByBrand[brands.find((b) => b.nameAr === brand)?.id || ""]?.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">السعر *</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e: any) => setPrice(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base" 
                placeholder="مثال: 5000" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">العملة *</label>
              <select 
                value={currency} 
                onChange={(e: any) => setCurrency(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              >
                <option value="دينار كويتي">دينار كويتي</option>
                <option value="ريال سعودي">ريال سعودي</option>
                <option value="درهم إماراتي">درهم إماراتي</option>
                <option value="دولار أمريكي">دولار أمريكي</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">سنة الصنع *</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e: any) => setYear(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base" 
                placeholder="مثال: 2021" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الممشي (كم) *</label>
              <input 
                type="number" 
                value={kilometers} 
                onChange={(e: any) => setKilometers(e.target.value)} 
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
              <option value="أبيض">أبيض</option>
              <option value="أسود">أسود</option>
              <option value="فضي">فضي</option>
              <option value="رمادي">رمادي</option>
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
            {loading ? "جاري رفع الصور ونشر الإعلان..." : "نشر الإعلان"}
          </button>
        </form>
      </div>
    </div>
  );
}
