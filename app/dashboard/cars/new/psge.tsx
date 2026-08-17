"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

const brands = [
  { id: "1", name: "بي إم دبليو", nameAr: "بي إم دبليو" },
  { id: "2", name: "مرسيدس", nameAr: "مرسيدس" },
  { id: "3", name: "تويوتا", nameAr: "تويوتا" },
  { id: "4", name: "هوندا", nameAr: "هوندا" }
];

const modelsByBrand: any = {
  "1": [
    { id: "1", name: "X5" },
    { id: "2", name: "Series 3" }
  ],
  "2": [
    { id: "3", name: "C-Class" },
    { id: "4", name: "E-Class" }
  ],
  "3": [
    { id: "5", name: "Camry" },
    { id: "6", name: "Corolla" }
  ],
  "4": [
    { id: "7", name: "Civic" },
    { id: "8", name: "Accord" }
  ]
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
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(`/api/upload?filename=${file.name}`, {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const blobData = await uploadRes.json();
          imageUrls.push(blobData.url);
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
        user_id: session.user.id,
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
    <div className="max-w-2xl mx-auto p-4" dir="rtl">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">إضافة إعلان سيارة جديدة</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الماركة *</label>
            <select value={brand} onChange={(e: any) => { setBrand(e.target.value); setModel(""); }} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800">
              <option value="">اختر الماركة</option>
              {brands.map((b) => <option key={b.id} value={b.nameAr}>{b.nameAr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الموديل *</label>
            <select value={model} onChange={(e: any) => setModel(e.target.value)} disabled={!brand} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 disabled:bg-gray-100">
              <option value="">اختر الموديل</option>
              {brand && modelsByBrand[brands.find((b: any) => b.nameAr === brand)?.id || ""]?.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السعر *</label>
            <input type="number" value={price} onChange={(e: any) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800" placeholder="5000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العملة *</label>
            <select value={currency} onChange={(e: any) => setCurrency(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800">
              {currencies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع *</label>
            <input type="number" value={year} onChange={(e: any) => setYear(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800" placeholder="2020" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الممشى (كم) *</label>
            <input type="number" value={kilometers} onChange={(e: any) => setKilometers(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800" placeholder="95000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اللون *</label>
            <select value={color} onChange={(e: any) => setColor(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800">
              <option value="">اختر اللون</option>
              {colors.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="border border-dashed border-blue-400 rounded-lg p-4 bg-blue-50/30">
            <label className="block text-sm font-medium text-gray-700 mb-2">صور السيارة (حد أقصى 4)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative aspect-square rounded border overflow-hidden bg-gray-100">
                  <img src={src} alt="preview" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{images.length}/4 صور تم اختيارها</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الإعلان</label>
            <textarea value={description} onChange={(e: any) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 h-24" placeholder="جيد"></textarea>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-blue-400">
            {loading ? "جاري النشر..." : "نشر الإعلان"}
          </button>
        </form>
      </div>
    </div>
  );
}
