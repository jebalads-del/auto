"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ تم إنشاء الحساب! تحقق من بريدك الإلكتروني");
        setName("");
        setEmail("");
        setPassword("");
      } else {
        alert("❌ " + (data.error || "حدث خطأ"));
      }
    } catch (error) {
      alert("❌ خطأ في الاتصال");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sty = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    boxSizing: "border-box" as const,
  };

  return (
    <div
      style={{
        direction: "rtl",
        textAlign: "right",
        padding: "30px 15px",
        fontFamily: "sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid #eee",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#0f172a" }}>
          إنشاء حساب جديد
        </h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="الاسم الكامل"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={sty}
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={sty}
          />
          <input
            type="password"
            placeholder="كلمة السر"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={sty}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#9ca3af" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "جاري الإنشاء..." : "تسجيل الحساب"}
          </button>
        </form>
        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            style={{
              color: "#2563eb",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
