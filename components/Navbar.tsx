'use client'

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/lectures", label: "المحاضرات والدروس" },
  { href: "/sermons", label: "الخطب" },
  { href: "/books", label: "المؤلفات" },
  { href: "/articles", label: "المقالات" },
  { href: "/about", label: "عن الشيخ" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(10, 10, 10, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-amiri)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#C9A84C",
            textDecoration: "none",
          }}
        >
          الدكتور إبراهيم صبحي
        </Link>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
          }}
          className="nav-links"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "#f5f0e8",
                textDecoration: "none",
                fontSize: "0.95rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#C9A84C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#f5f0e8";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#C9A84C",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
          className="mobile-menu-btn"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div
          style={{
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
          className="mobile-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                color: "#f5f0e8",
                textDecoration: "none",
                fontSize: "1rem",
                padding: "0.5rem 0",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
