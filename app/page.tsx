"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // جلب البيانات من الـ API بشكل آمن
    fetch("/api/ads")
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => {
        // التحقق من البيانات لمنع الـ Client-side Exception
        if (Array.isArray(data)) {
          setAds(data);
        } else if (data && Array.isArray(data.ads)) {
          setAds(data.ads);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>جاري تحميل الإعلانات المتاحة...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", textAlign: "center", color: "red" }}>حدث خطأ أثناء جلب البيانات، يرجى المحاولة لاحقاً.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚗 سيارتي - الإعلانات المتاحة</h1>
      {ads.length === 0 ? (
        <p>لا توجد إعلانات معروضة حالياً.</p>
      ) : (
        ads.map((ad: any) => (
          <div key={ad.id || ad._id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
            <h3>{ad.title || "إعلان بدون عنوان"}</h3>
            <p>{ad.description || ""}</p>
          </div>
        ))
      )}
    </div>
  );
}

