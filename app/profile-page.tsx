"use client";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [user] = useState({ name: "مستخدم تجريبي", email: "user@sayarty.store", phone: "+9665000000" });

  return (
    <div style={{ direction: "rtl", textAlign: "right", padding: "15px", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#0f172a", color: "#fff", padding: "20px", borderRadius: "12px", textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>👤 حسابي الشخصي</h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: "5px 0 0 0" }}>مرحباً بك في موقع سيارتي</p>
      </div>

      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "15px" }}>
        <h3 style={{ marginTop: 0, color: "#1e293b", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>البيانات الشخصية</h3>
        <p style={{ margin: "10px 0" }}><b>الاسم:</b> {user.name}</p>
        <p style={{ margin: "10px 0" }}><b>البريد:</b> {user.email}</p>
        <p style={{ margin: "10px 0" }}><b>الهاتف:</b> {user.phone}</p>
      </div>

      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" }}>
        <h3 style={{ marginTop: 0, color: "#1e293b", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>إعلاناتي المنشورة</h3>
        <p style={{ color: "#64748b", fontSize: "14px" }}>لم تقم بنشر أي إعلانات سيارات حتى الآن.</p>
        <Link href="/dashboard" style={{ display: "inline-block", marginTop: "5px", padding: "10px 15px", backgroundColor: "#059669", color: "#fff", borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
          🚗 أضف إعلاناً مجانياً الآن
        </Link>
      </div>
    </div>
  );
}

