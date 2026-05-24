import { supabase } from "@/lib/supabase"
import Link from "next/link"
import ArticleImage from "@/components/ArticleImage"

const PER_PAGE = 10

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page: pageStr, search } = await searchParams
  const page = Math.max(1, parseInt(pageStr || "1", 10) || 1)
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  let query = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("published", true)

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  const { data: articles, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  const totalPages = count ? Math.ceil(count / PER_PAGE) : 0

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1rem" }}>
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
        المقالات
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#999",
          fontFamily: "var(--font-noto)",
          marginBottom: "2rem",
          fontSize: "1rem",
        }}
      >
        مقالات وفكر الدكتور إبراهيم صبحي
      </p>

      <form
        action="/articles"
        method="GET"
        style={{
          marginBottom: "2.5rem",
          maxWidth: "500px",
          marginLeft: "auto",
          marginRight: "auto",
          position: "relative",
        }}
      >
        <input
          type="text"
          name="search"
          defaultValue={search || ""}
          placeholder="ابحث في المقالات..."
          style={{
            width: "100%",
            backgroundColor: "#111111",
            border: "1px solid rgba(201, 168, 76, 0.3)",
            borderRadius: "10px",
            padding: "0.75rem 5rem 0.75rem 1rem",
            color: "#f5f0e8",
            fontFamily: "var(--font-noto)",
            fontSize: "0.95rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          style={{
            position: "absolute",
            left: "4px",
            top: "4px",
            bottom: "4px",
            backgroundColor: "#C9A84C",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "8px",
            padding: "0 1.25rem",
            fontFamily: "var(--font-noto)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          className="search-btn"
        >
          بحث
        </button>
      </form>

      {articles && articles.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.id}`}
              style={{ textDecoration: "none", display: "block" }}
              className="article-card"
            >
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  backgroundColor: "#111111",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(201, 168, 76, 0.15)",
                  transition: "transform 0.3s ease, border-color 0.3s ease",
                }}
                className="article-card-inner"
              >
                {article.cover_url && (
                  <div
                    style={{
                      flexShrink: 0,
                      width: "200px",
                      backgroundColor: "rgba(201, 168, 76, 0.15)",
                    }}
                    className="article-cover-col"
                  >
                    <ArticleImage src={article.cover_url} alt={article.title} />
                  </div>
                )}
                <div
                  style={{
                    flex: 1,
                    padding: "1.25rem",
                    minWidth: 0,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-amiri)",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#C9A84C",
                      margin: "0 0 0.5rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p
                      style={{
                        fontFamily: "var(--font-noto)",
                        fontSize: "0.9rem",
                        color: "#f5f0e8",
                        lineHeight: 1.7,
                        margin: "0 0 1rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {article.excerpt}
                    </p>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {article.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            backgroundColor: "rgba(201, 168, 76, 0.1)",
                            color: "#C9A84C",
                            fontFamily: "var(--font-noto)",
                            fontSize: "0.75rem",
                            padding: "2px 10px",
                            borderRadius: "20px",
                            border: "1px solid rgba(201, 168, 76, 0.25)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
          {search ? "لا توجد نتائج للبحث" : "لا توجد مقالات متاحة حالياً"}
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
              href={`/articles?page=${page - 1}${search ? `&search=${search}` : ""}`}
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
              href={`/articles?page=${p}${search ? `&search=${search}` : ""}`}
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
              href={`/articles?page=${page + 1}${search ? `&search=${search}` : ""}`}
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
        .article-card:hover .article-card-inner {
          transform: translateY(-2px);
          border-color: rgba(201, 168, 76, 0.5) !important;
        }
        .search-btn:hover {
          background-color: #D4B85A;
        }
        .pagination-link:hover {
          border-color: #C9A84C !important;
        }
        @media (max-width: 640px) {
          .article-cover-col {
            width: 120px !important;
          }
        }
      `}</style>
    </div>
  )
}
