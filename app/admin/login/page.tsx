"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.replace("/admin");
    } else {
      setError("كلمة المرور غير صحيحة");
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>لوحة التحكم</h1>
          <p style={subtitleStyle}>الدكتور إبراهيم صبحي</p>
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            dir="rtl"
            style={inputStyle}
            autoFocus
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#0a0a0a",
  fontFamily: "var(--font-amiri)",
  padding: "1rem",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#111111",
  border: "1px solid rgba(201, 168, 76, 0.3)",
  borderRadius: "12px",
  padding: "2.5rem",
  width: "100%",
  maxWidth: "400px",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "2rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "#C9A84C",
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#999",
  marginTop: "0.5rem",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const inputStyle: React.CSSProperties = {
  padding: "0.85rem 1rem",
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: "8px",
  color: "#f5f0e8",
  fontSize: "1rem",
  fontFamily: "var(--font-noto)",
  outline: "none",
};

const errorStyle: React.CSSProperties = {
  color: "#e74c3c",
  fontSize: "0.9rem",
  textAlign: "center",
  fontFamily: "var(--font-noto)",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.85rem",
  backgroundColor: "#C9A84C",
  color: "#0a0a0a",
  border: "none",
  borderRadius: "8px",
  fontSize: "1.1rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "var(--font-amiri)",
  transition: "opacity 0.2s",
};
