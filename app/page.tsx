import Image from 'next/image';
import Link from 'next/link';

// واجهة البيانات المتوقعة من قاعدة بيانات Neon
interface CarAd {
  id: number;
  title: string;
  price: number;
  brand: string;
  year: number;
  image_url?: string; // جعلناها اختيارية لحماية الصفحة من الانكسار
}

// دالة جلب البيانات من الـ API الخاص بمشروعك
async function getCars(): Promise<CarAd[]> {
  try {
    // استبدل الرابط برابط الـ API الفعلي لديك إذا كان مختلفاً
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/cars`, {
      cache: 'no-store' // لضمان جلب الإعلانات الجديدة فوراً بعد موافقة الأدمن
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch cars:", error);
    return [];
  }
}

export default async function HomePage() {
  const cars = await getCars();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* شريط الملاحة العلوي */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
            AUTO<span className="text-gray-700">ADS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
              أعلن عن سيارتك
            </Link>
          </div>
        </div>
      </header>

      {/* القسم الترحيبي (Hero Section) */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            سوق السيارات الأول لإعلاناتك
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            تصفح آلاف السيارات المعروضة للبيع أو أضف إعلانك الخاص مجاناً وبكل سهولة.
          </p>
        </div>
      </section>

      {/* قسم عرض الإعلانات */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-2 border-b border-gray-200">
          أحدث السيارات المضافة
        </h2>

        {cars.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">لا توجد إعلانات متاحة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cars.map((car) => (
              <Link 
                key={car.id} 
                href={`/car/${car.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col"
              >
                {/* منطقة الصورة وحمايتها */}
                <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
                  {car.image_url ? (
                    <Image
                      src={car.image_url}
                      alt={car.title}
                      fill
                      sizes="(max-w-7xl) 25vw"
                      className="object-cover group-hover:scale-105 transition duration-300"
                      priority={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                      <span className="text-sm font-medium">لا توجد صورة متوفرة</span>
                    </div>
                  )}
                </div>

                {/* تفاصيل السيارة */}
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {car.brand}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-2 text-base line-clamp-1 group-hover:text-blue-600 transition">
                      {car.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">موديل {car.year}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-green-600">
                      {car.price.toLocaleString()} <span className="text-xs font-normal">دولار</span>
                    </span>
                    <span className="text-xs text-blue-500 font-medium group-hover:underline">
                      التفاصيل ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
