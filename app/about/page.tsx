export default function AboutPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1rem" }}>
      <div
        style={{
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-amiri)",
            fontSize: "3rem",
            fontWeight: 700,
            color: "#C9A84C",
            margin: "0 0 1rem",
          }}
        >
          عن الشيخ
        </h1>
        <div
          style={{
            width: "80px",
            height: "3px",
            backgroundColor: "#C9A84C",
            margin: "0 auto",
            borderRadius: "2px",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "3rem",
          alignItems: "flex-start",
          marginBottom: "3rem",
        }}
        className="about-layout"
      >
        <div
          style={{
            flexShrink: 0,
            width: "300px",
            height: "360px",
            backgroundColor: "#111111",
            borderRadius: "16px",
            border: "2px solid #C9A84C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontFamily: "var(--font-noto)",
            fontSize: "1rem",
            overflow: "hidden",
          }}
          className="about-image-placeholder"
        >
          <img
            src="https://i.postimg.cc/mrD8LR5J/Whats-App-Image-2026-05-24-at-9-58-18-PM.jpg"
            alt="الدكتور إبراهيم صبحي"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontFamily: "var(--font-amiri)",
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#C9A84C",
              margin: "0 0 1.5rem",
            }}
          >
            الدكتور إبراهيم صبحي
          </h2>

          <div
            style={{
              fontFamily: "var(--font-noto)",
              fontSize: "1rem",
              color: "#f5f0e8",
              lineHeight: 2,
            }}
          >
            <p style={{ margin: "0 0 1.25rem" }}>
              الدكتور إبراهيم صبحي إمام وخطيب، خريج الأزهر الشريف، حاصل على درجتي الماجستير والدكتوراه في العلوم الشرعية له العديد من المؤلفات والكتب التي تغطي مختلف مجالات العلوم الشرعية، من التفسير والفقه إلى الفكر الإسلامي وقضايا الأمة.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem",
          paddingTop: "2.5rem",
          borderTop: "1px solid rgba(201, 168, 76, 0.2)",
        }}
      >
        <div
          style={{
            backgroundColor: "#111111",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid rgba(201, 168, 76, 0.15)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-amiri)",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#C9A84C",
              marginBottom: "0.5rem",
            }}
          >
            مؤلفات
          </div>
          <div
            style={{
              fontFamily: "var(--font-noto)",
              fontSize: "0.9rem",
              color: "#999",
            }}
          >
            كتب وبحوث شرعية
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#111111",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid rgba(201, 168, 76, 0.15)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-amiri)",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#C9A84C",
              marginBottom: "0.5rem",
            }}
          >
            محاضرات
          </div>
          <div
            style={{
              fontFamily: "var(--font-noto)",
              fontSize: "0.9rem",
              color: "#999",
            }}
          >
            دروس وخطب مسجلة
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#111111",
            padding: "1.5rem",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid rgba(201, 168, 76, 0.15)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-amiri)",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#C9A84C",
              marginBottom: "0.5rem",
            }}
          >
            مقالات
          </div>
          <div
            style={{
              fontFamily: "var(--font-noto)",
              fontSize: "0.9rem",
              color: "#999",
            }}
          >
            فكر ورؤى إسلامية
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-layout {
            flex-direction: column !important;
            align-items: center !important;
          }
          .about-image-placeholder {
            width: 220px !important;
            height: 260px !important;
          }
        }
      `}</style>
    </div>
  )
}
