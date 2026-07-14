"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✉️ تم إرسال رابط استعادة كلمة السر إلى بريدك الإلكتروني بنجاح.");
  };

  const sty = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "15px", boxSizing: "border-box" as const };

  return (
    <div style={{ direction: "rtl", textAlign: "right", padding: "30px 15px", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "12px", border: "1px solid #eee", width: "100%", maxWidth: "400px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#0f172a" }}>استعادة كلمة السر</h2>
        <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "20px" }}>أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة السر الخاصة بك.</p>
        <form onSubmit={handleReset}>
          <input type="email" placeholder="بريدك الإلكتروني المسجل" required value={email} onChange={(e) => setEmail(e.target.value)} style={sty} />
          <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>إرسال رابط الاستعادة</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px", color: "#64748b" }}>
          <Link href="/login" style={{ color: "#2563eb", textDecoration: "none" }}>العودة لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}

