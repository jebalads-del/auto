"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => {
        if (!res.ok) throw new Error("Network response error");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAds(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", direction: "rtl", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {/* شريط التنقل العلوي (Navigation Bar) */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: "15px", marginBottom: "20px" }}>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>🚗 سيارتي</div>
        <div style={{ display: "flex", gap: "15px" }}>
          <Link href="/login" style={{ padding: "8px 16px", backgroundColor: "#0070f3", color: "white", borderRadius: "5px", textDecoration: "none", fontWeight: "bold" }}>
            تسجيل الدخول
          </Link>
          <Link href="/dashboard" style={{ padding: "8px 16px", backgroundColor: "#eaeaea", color: "#333", borderRadius: "5px", textDecoration: "none", fontWeight: "bold" }}>
            لوحة التحكم
          </Link>
        </div>
      </nav>

      {/* محتوى الصفحة الرئيسي */}
      <main>
        <h2 style={{ marginBottom: "20px" }}>الأقسام والإعلانات المتاحة</h2>
        
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>جاري تحميل الإعلانات السحابية...</p>
        ) : ads.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: "40px", border: "1px dashed #ccc", borderRadius: "8px" }}>
            لا توجد إعلانات معروضة حالياً في قاعدة البيانات السحابية.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {ads.map((ad: any) => (
              <div key={ad.id || ad._id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#fff" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{ad.title}</h3>
                <p style={{ color: "#0070f3", fontWeight: "bold", margin: "0 0 10px 0" }}>السعر: {ad.price} ريال/دولار</p>
                <p style={{ color: "#666", margin: 0 }}>{ad.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

