import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let book
  try {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .single()

    if (error || !data) {
      notFound()
    }
    book = data
  } catch {
    notFound()
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1rem" }}>
      <Link
        href="/books"
        style={{
          color: "#C9A84C",
          textDecoration: "none",
          fontFamily: "var(--font-noto)",
          fontSize: "0.95rem",
          display: "inline-block",
          marginBottom: "2rem",
          transition: "opacity 0.2s",
        }}
        className="back-link"
      >
        ← العودة إلى المؤلفات
      </Link>

      <div
        style={{
          display: "flex",
          gap: "3rem",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
        className="book-layout"
      >
        <div style={{ flexShrink: 0, width: "350px" }} className="book-cover-col">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              style={{
                width: "100%",
                borderRadius: "12px",
                border: "1px solid rgba(201, 168, 76, 0.3)",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "2/3",
                backgroundColor: "#1a1a1a",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontFamily: "var(--font-amiri)",
                fontSize: "1.3rem",
                border: "1px solid rgba(201, 168, 76, 0.2)",
              }}
            >
              غلاف الكتاب
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-amiri)",
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#C9A84C",
              margin: "0 0 1.5rem",
              lineHeight: 1.3,
            }}
          >
            {book.title}
          </h1>

          {book.description && (
            <p
              style={{
                fontFamily: "var(--font-noto)",
                fontSize: "1rem",
                color: "#f5f0e8",
                lineHeight: 1.8,
                margin: "0 0 2rem",
              }}
            >
              {book.description}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              marginBottom: "2.5rem",
            }}
          >
            {book.author && (
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-noto)",
                    fontSize: "0.85rem",
                    color: "#999",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  المؤلف
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-amiri)",
                    fontSize: "1.1rem",
                    color: "#f5f0e8",
                  }}
                >
                  {book.author}
                </span>
              </div>
            )}
            {book.publisher && (
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-noto)",
                    fontSize: "0.85rem",
                    color: "#999",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  الناشر
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-noto)",
                    fontSize: "1rem",
                    color: "#f5f0e8",
                  }}
                >
                  {book.publisher}
                </span>
              </div>
            )}
            {book.year && (
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-noto)",
                    fontSize: "0.85rem",
                    color: "#999",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  سنة النشر
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-noto)",
                    fontSize: "1rem",
                    color: "#f5f0e8",
                  }}
                >
                  {book.year}
                </span>
              </div>
            )}
            {book.pages && (
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-noto)",
                    fontSize: "0.85rem",
                    color: "#999",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  عدد الصفحات
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-noto)",
                    fontSize: "1rem",
                    color: "#f5f0e8",
                  }}
                >
                  {book.pages}
                </span>
              </div>
            )}
          </div>

          {book.pdf_url && (
            <a
              href={book.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#C9A84C",
                color: "#0a0a0a",
                fontFamily: "var(--font-noto)",
                fontSize: "1.05rem",
                fontWeight: 600,
                padding: "0.85rem 2.5rem",
                borderRadius: "10px",
                textDecoration: "none",
                transition: "background-color 0.2s, transform 0.2s",
              }}
              className="download-btn"
            >
              تحميل الكتاب (PDF)
            </a>
          )}

          <p
            style={{
              color: "#999",
              fontFamily: "var(--font-noto)",
              fontSize: "0.85rem",
              marginTop: "1rem",
            }}
          >
            {book.downloads || 0} تحميل
          </p>
        </div>
      </div>

      <style>{`
        .back-link:hover {
          opacity: 0.7;
        }
        .download-btn:hover {
          background-color: #D4B85A;
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .book-layout {
            flex-direction: column !important;
          }
          .book-cover-col {
            width: 100% !important;
            max-width: 300px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  )
}
