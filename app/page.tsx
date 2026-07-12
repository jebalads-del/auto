"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", direction: "rtl", padding: "15px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* شريط التنقل العلوي الأنيق */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: "12px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", marginBottom: "20px" }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1e293b" }}>🚗 سيارتي</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/login" style={{ padding: "8px 14px", backgroundColor: "#0070f3", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>
            تسجيل الدخول
          </Link>
          <Link href="/dashboard" style={{ padding: "8px 14px", backgroundColor: "#f1f5f9", color: "#334155", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>
            لوحة التحكم
          </Link>
        </div>
      </nav>

      {/* عنوان المعرض */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 style={{ color: '#1e293b', margin: 0, fontSize: "18px" }}>🚗 السيارات المعروضة حديثاً</h2>
        <Link href="/dashboard" style={{ padding: "6px 12px", backgroundColor: "#10b981", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}>➕ أرسل إعلانك</Link>
      </div>
      
      {/* عرض السيارات المرفوعة */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>جاري تحميل السيارات من السحابة...</p>
      ) : ads.length === 0 ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: "30px", backgroundColor: "#fff", borderRadius: "10px" }}>لا توجد سيارات معروضة حالياً.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {ads.map((ad: any) => {
            // تفكيك مصفوفة الصور المخزنة في قاعدة البيانات بأمان
            let carImages: string[] = [];
            try {
              if (ad.image_url && ad.image_url.startsWith("[")) {
                carImages = JSON.parse(ad.image_url);
              } else if (ad.image_url) {
                carImages = [ad.image_url];
              }
            } catch {
              carImages = [];
            }

            return (
              <div key={ad.id} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                
                {/* عرض الصور المرفوعة من المعرض إن وجدت أو صورة افتراضية */}
                {carImages.length > 0 ? (
                  <div style={{ display: "flex", gap: "5px", padding: "8px", overflowX: "auto", backgroundColor: "#f1f5f9" }}>
                    {carImages.map((imgUrl: string, index: number) => (
                      <img key={index} src={imgUrl} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} alt="Car" />
                    ))}
                  </div>
                ) : (
                  <div style={{ height: "160px", backgroundColor: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>لا توجد صور متوفرة للسيارة</div>
                )}

                {/* تفاصيل السيارة */}
                <div style={{ padding: "15px" }}>
                  <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "16px" }}>{ad.title}</h3>
                  <div style={{ color: "#0070f3", fontWeight: "bold", fontSize: "15px", marginBottom: "10px" }}>السعر: {ad.price} $</div>
                  <p style={{ color: "#475569", margin: 0, fontSize: "14px", lineHeight: "1.5", backgroundColor: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                    <strong>الوصف والمواصفات:</strong> {ad.description || "لا توجد تفاصيل إضافية مضافة."}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
