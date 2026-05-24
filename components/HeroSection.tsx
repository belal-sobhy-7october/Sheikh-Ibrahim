"use client";

export default function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "linear-gradient(to bottom, #0a0a0a, #1a1a1a)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='%23C9A84C' fill-opacity='0.03'%3E%3Cpath d='M60 0L75 22L100 10L90 35L120 35L100 55L115 80L90 70L85 100L60 85L35 100L30 70L5 80L20 55L0 35L30 35L20 10L45 22Z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "120px 120px",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem",
          maxWidth: "800px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-amiri)",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 700,
            color: "#C9A84C",
            marginBottom: "1rem",
            lineHeight: 1.3,
          }}
        >
          الدكتور إبراهيم صبحي
        </h1>
        <p
          style={{
            fontFamily: "var(--font-noto)",
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            color: "#ccc",
            marginBottom: "2.5rem",
            lineHeight: 1.8,
          }}
        >
          عالم، داعية، مفكر إسلامي
        </p>
        <a
          href="/about"
          style={{
            display: "inline-block",
            padding: "0.85rem 2.5rem",
            backgroundColor: "#C9A84C",
            color: "#0a0a0a",
            textDecoration: "none",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: "4px",
            transition: "all 0.3s ease",
            fontFamily: "var(--font-noto)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#D4B85A";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#C9A84C";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          تعرف على الشيخ
        </a>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(to left, transparent, #C9A84C, transparent)",
        }}
      />
    </section>
  );
}
