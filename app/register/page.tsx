"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert("🎉 تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
  };

  const sty = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "15px", boxSizing: "border-box" as const };

  return (
    <div style={{ direction: "rtl", textAlign: "right", padding: "30px 15px", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "#fff", padding: "25px", borderRadius: "12px", border: "1px solid #eee", width: "100%", maxWidth: "400px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#0f172a" }}>إنشاء حساب جديد</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="الاسم الكامل" required value={name} onChange={(e) => setName(e.target.value)} style={sty} />
          <input type="email" placeholder="البريد الإلكتروني" required value={email} onChange={(e) => setEmail(e.target.value)} style={sty} />
          <input type="password" placeholder="كلمة السر" required value={password} onChange={(e) => setPassword(e.target.value)} style={sty} />
          <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>تسجيل الحساب</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px", color: "#64748b" }}>
          لديك حساب بالفعل؟ <Link href="/login" style={{ color: "#2563eb", fontWeight: "bold", textDecoration: "none" }}>تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
