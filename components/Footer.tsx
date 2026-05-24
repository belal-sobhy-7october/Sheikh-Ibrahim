import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#111111",
        borderTop: "1px solid rgba(201, 168, 76, 0.2)",
        padding: "3rem 1rem 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2rem",
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: "var(--font-amiri)",
              fontSize: "1.25rem",
              color: "#C9A84C",
              marginBottom: "0.75rem",
            }}
          >
            الدكتور إبراهيم صبحي
          </h3>
          <p style={{ color: "#999", fontSize: "0.9rem", lineHeight: 1.8 }}>
            عالم، داعية، مفكر إسلامي. موقع رسمي يضم المحاضرات والخطب والمؤلفات
            والمقالات
          </p>
        </div>

        <div>
          <h4
            style={{
              fontFamily: "var(--font-amiri)",
              fontSize: "1.1rem",
              color: "#C9A84C",
              marginBottom: "0.75rem",
            }}
          >
            التصنيفات
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/lectures" style={{ color: "#999", textDecoration: "none", fontSize: "0.9rem" }}>
              المحاضرات والدروس
            </Link>
            <Link href="/sermons" style={{ color: "#999", textDecoration: "none", fontSize: "0.9rem" }}>
              الخطب
            </Link>
            <Link href="/books" style={{ color: "#999", textDecoration: "none", fontSize: "0.9rem" }}>
              المؤلفات
            </Link>
            <Link href="/articles" style={{ color: "#999", textDecoration: "none", fontSize: "0.9rem" }}>
              المقالات
            </Link>
          </div>
        </div>

        <div>
          <h4
            style={{
              fontFamily: "var(--font-amiri)",
              fontSize: "1.1rem",
              color: "#C9A84C",
              marginBottom: "0.75rem",
            }}
          >
            روابط
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/about" style={{ color: "#999", textDecoration: "none", fontSize: "0.9rem" }}>
              عن الشيخ
            </Link>
            <Link href="/admin" style={{ color: "#999", textDecoration: "none", fontSize: "0.9rem" }}>
              لوحة التحكم
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "2rem auto 0",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(201, 168, 76, 0.1)",
          textAlign: "center",
          color: "#666",
          fontSize: "0.85rem",
        }}
      >
        جميع الحقوق محفوظة © {new Date().getFullYear()} — الدكتور إبراهيم صبحي
      </div>
    </footer>
  );
}
