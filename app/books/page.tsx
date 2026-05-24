import { supabase } from "@/lib/supabase"
import Link from "next/link"

const PER_PAGE = 10

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr || "1", 10) || 1)
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  const { data: books, count } = await supabase
    .from("books")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, to)

  const totalPages = count ? Math.ceil(count / PER_PAGE) : 0

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1rem" }}>
      <h1
        style={{
          fontFamily: "var(--font-amiri)",
          fontSize: "2.5rem",
          fontWeight: 700,
          color: "#C9A84C",
          textAlign: "center",
          marginBottom: "0.5rem",
        }}
      >
        المؤلفات
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#999",
          fontFamily: "var(--font-noto)",
          marginBottom: "3rem",
          fontSize: "1rem",
        }}
      >
        كتب ومؤلفات الدكتور إبراهيم صبحي
      </p>

      {books && books.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              style={{ textDecoration: "none", display: "block" }}
              className="book-card"
            >
              <div
                style={{
                  backgroundColor: "#111111",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(201, 168, 76, 0.2)",
                  transition: "transform 0.3s ease, border-color 0.3s ease",
                }}
              >
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "300px",
                      backgroundColor: "#1a1a1a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontFamily: "var(--font-amiri)",
                      fontSize: "1.2rem",
                    }}
                  >
                    غلاف الكتاب
                  </div>
                )}
                <div style={{ padding: "1rem" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-amiri)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#f5f0e8",
                      margin: "0 0 0.5rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {book.title}
                  </h3>
                  {book.year && (
                    <p
                      style={{
                        color: "#999",
                        fontSize: "0.85rem",
                        margin: "0 0 0.25rem",
                        fontFamily: "var(--font-noto)",
                      }}
                    >
                      {book.year}
                    </p>
                  )}
                  <p
                    style={{
                      color: "#C9A84C",
                      fontSize: "0.8rem",
                      margin: 0,
                      fontFamily: "var(--font-noto)",
                    }}
                  >
                    {book.downloads || 0} تحميل
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p
          style={{
            textAlign: "center",
            color: "#999",
            fontFamily: "var(--font-noto)",
            fontSize: "1.1rem",
            padding: "3rem 0",
          }}
        >
          لا توجد كتب متاحة حالياً
        </p>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "3rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {page > 1 && (
            <Link
              href={`/books?page=${page - 1}`}
              style={{
                color: "#f5f0e8",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(201, 168, 76, 0.3)",
                fontFamily: "var(--font-noto)",
                fontSize: "0.9rem",
                transition: "border-color 0.2s",
              }}
              className="pagination-link"
            >
              السابق
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/books?page=${p}`}
              style={{
                color: p === page ? "#0a0a0a" : "#f5f0e8",
                textDecoration: "none",
                padding: "0.5rem 0.85rem",
                borderRadius: "8px",
                backgroundColor: p === page ? "#C9A84C" : "transparent",
                border:
                  p === page
                    ? "1px solid #C9A84C"
                    : "1px solid rgba(201, 168, 76, 0.3)",
                fontFamily: "var(--font-noto)",
                fontSize: "0.9rem",
                transition: "background-color 0.2s, color 0.2s",
              }}
              className="pagination-link"
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={`/books?page=${page + 1}`}
              style={{
                color: "#f5f0e8",
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid rgba(201, 168, 76, 0.3)",
                fontFamily: "var(--font-noto)",
                fontSize: "0.9rem",
                transition: "border-color 0.2s",
              }}
              className="pagination-link"
            >
              التالي
            </Link>
          )}
        </div>
      )}

      <style>{`
        .book-card:hover > div {
          transform: translateY(-4px);
          border-color: #C9A84C !important;
        }
        .pagination-link:hover {
          border-color: #C9A84C !important;
        }
      `}</style>
    </div>
  )
}
