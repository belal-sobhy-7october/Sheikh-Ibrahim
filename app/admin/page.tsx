"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type TableName = "lectures" | "sermons" | "books" | "articles";

interface CountData {
  key: TableName;
  label: string;
  icon: string;
  total: number;
  published: number;
}

interface RecentItem {
  id: string;
  title: string;
  created_at: string;
  typeLabel: string;
}

interface StatsData {
  counts: CountData[];
  latestItems: RecentItem[];
}

type TabId = "dashboard" | TableName;

type FormMode = "add" | "edit";

interface ModalState {
  open: boolean;
  mode: FormMode;
  table: TableName;
  item: Record<string, unknown> | null;
}

const tabs: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "الرئيسية" },
  { id: "lectures", label: "المحاضرات" },
  { id: "sermons", label: "الخطب" },
  { id: "books", label: "الكتب" },
  { id: "articles", label: "المقالات" },
];

const tableLabels: Record<TableName, string> = {
  lectures: "المحاضرات والدروس",
  sermons: "الخطب",
  books: "الكتب",
  articles: "المقالات",
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")} س`;
  return `${m} د`;
}

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : "";
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [tableData, setTableData] = useState<Record<TableName, unknown[]>>({
    lectures: [],
    sermons: [],
    books: [],
    articles: [],
  });
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "add",
    table: "lectures",
    item: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  }, []);

  const fetchTable = useCallback(async (table: TableName) => {
    const res = await fetch(`/api/admin/data?table=${table}`);
    if (res.ok) {
      const data = await res.json();
      setTableData((prev) => ({ ...prev, [table]: data.data }));
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) {
          router.replace("/admin/login");
        } else {
          setAuthed(true);
        }
      });
  }, [router]);

  useEffect(() => {
    if (authed) {
      setLoading(true);
      Promise.all([fetchStats(), ...(["lectures", "sermons", "books", "articles"] as TableName[]).map(fetchTable)])
        .finally(() => setLoading(false));
    }
  }, [authed, fetchStats, fetchTable]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const openAddModal = (table: TableName) => {
    setModal({ open: true, mode: "add", table, item: null });
  };

  const openEditModal = (table: TableName, item: Record<string, unknown>) => {
    setModal({ open: true, mode: "edit", table, item });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "add", table: "lectures", item: null });
  };

  const handleSave = async (rawFields: Record<string, unknown>) => {
    setSaving(true);
    const fields = { ...rawFields };
    if ((modal.table === "lectures" || modal.table === "sermons") && fields.media_url) {
      const url = fields.media_url as string;
      if (/(?:youtube\.com|youtu\.be)/.test(url)) {
        fields.youtube_url = url;
        fields.audio_url = null;
      } else {
        fields.audio_url = url;
        fields.youtube_url = null;
      }
      delete fields.media_url;
    }
    if (modal.table === "lectures") {
      delete fields.duration;
    }
    if (modal.table === "sermons") {
      delete fields.sermon_date;
      delete fields.location;
    }
    if (modal.table === "articles" && typeof fields.tags === "string") {
      fields.tags = (fields.tags as string).split(",").map((t) => t.trim()).filter(Boolean);
    }
    const urlPath = modal.mode === "add"
      ? "/api/admin/data"
      : `/api/admin/data/${modal.item?.id}`;
    const method = modal.mode === "add" ? "POST" : "PUT";
    const body = modal.mode === "add"
      ? { table: modal.table, ...fields }
      : { table: modal.table, ...fields };

    const res = await fetch(urlPath, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (res.ok) {
      closeModal();
      await Promise.all([fetchStats(), fetchTable(modal.table)]);
    } else {
      const err = await res.json();
      alert(`خطأ: ${err.error || "حدث خطأ أثناء الحفظ"}`);
    }
  };

  const handleDelete = async (table: TableName, id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/data/${id}?table=${table}`, {
      method: "DELETE",
    });
    setDeleting(null);
    if (res.ok) {
      await Promise.all([fetchStats(), fetchTable(table)]);
    } else {
      const err = await res.json();
      alert(`خطأ: ${err.error || "حدث خطأ أثناء الحذف"}`);
    }
  };

  if (authed !== true) return null;

  return (
    <div style={pageStyle}>
      {modal.open && (
        <ModalForm
          mode={modal.mode}
          table={modal.table}
          item={modal.item}
          saving={saving}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      <div style={headerStyle}>
        <h1 style={headingStyle}>لوحة التحكم</h1>
        <button onClick={handleLogout} style={logoutBtnStyle}>
          تسجيل الخروج
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...tabBtnStyle,
              backgroundColor: activeTab === tab.id ? "#C9A84C" : "#1a1a1a",
              color: activeTab === tab.id ? "#0a0a0a" : "#f5f0e8",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#666", fontSize: "1.1rem" }}>جاري التحميل...</p>
      ) : activeTab === "dashboard" ? (
        <DashboardView stats={stats} />
      ) : (
        <TableView
          table={activeTab}
          items={tableData[activeTab]}
          deleting={deleting}
          onAdd={() => openAddModal(activeTab)}
          onEdit={(item) => openEditModal(activeTab, item)}
          onDelete={(id) => handleDelete(activeTab, id)}
        />
      )}
    </div>
  );
}

function DashboardView({ stats }: { stats: StatsData | null }) {
  if (!stats) {
    return <p style={{ textAlign: "center", color: "#666" }}>لا توجد بيانات</p>;
  }

  return (
    <>
      <div style={gridStyle}>
        {stats.counts.map((c) => (
          <div key={c.key} style={cardStyle}>
            <div style={iconStyle}>{c.icon}</div>
            <div style={cardLabelStyle}>{c.label}</div>
            <div style={statsRowStyle}>
              <span style={statLabelStyle}>الكل:</span>
              <span style={statValueStyle}>{c.total}</span>
            </div>
            <div style={statsRowStyle}>
              <span style={statLabelStyle}>المنشور:</span>
              <span style={{ ...statValueStyle, color: "#C9A84C" }}>
                {c.published}
              </span>
            </div>
          </div>
        ))}
      </div>

      <h2 style={sectionTitleStyle}>آخر الإضافات</h2>
      {stats.latestItems.length > 0 ? (
        <div style={listStyle}>
          {stats.latestItems.map((item, i) => (
            <div key={`${i}-${item.id}`} style={itemRowStyle}>
              <span style={badgeStyle}>{item.typeLabel}</span>
              <span style={itemTitleStyle}>{item.title}</span>
              <span style={itemDateStyle}>{formatDate(item.created_at)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={emptyStyle}>لا توجد إضافات بعد</p>
      )}
    </>
  );
}

function TableView({
  table,
  items,
  deleting,
  onAdd,
  onEdit,
  onDelete,
}: {
  table: TableName;
  items: unknown[];
  deleting: string | null;
  onAdd: () => void;
  onEdit: (item: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const typedItems = items as Record<string, unknown>[];

  return (
    <div>
      <div style={tableHeaderStyle}>
        <h2 style={sectionTitleStyle}>{tableLabels[table]}</h2>
        <button onClick={onAdd} style={addBtnStyle}>
          + إضافة جديد
        </button>
      </div>

      {typedItems.length === 0 ? (
        <p style={emptyStyle}>لا توجد عناصر في هذا القسم</p>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>العنوان</th>
                {table === "sermons" && <th style={thStyle}>المدة</th>}
                {table === "sermons" && <th style={thStyle}>التاريخ</th>}
                {table === "books" && <th style={thStyle}>الناشر</th>}
                {table === "books" && <th style={thStyle}>السنة</th>}
                {table === "articles" && <th style={thStyle}>مقتطف</th>}
                <th style={thStyle}>الحالة</th>
                <th style={thStyle}>التاريخ</th>
                <th style={thStyle}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {typedItems.map((item) => (
                <tr key={item.id as string} style={trStyle}>
                  <td style={tdStyle}>{item.title as string}</td>
                  {table === "sermons" && (
                    <td style={tdStyle}>
                      {formatDuration(item.duration as number | null)}
                    </td>
                  )}
                  {table === "sermons" && (
                    <td style={tdStyle}>
                      {item.sermon_date
                        ? formatDate(item.sermon_date as string)
                        : "-"}
                    </td>
                  )}
                  {table === "books" && (
                    <td style={tdStyle}>{item.publisher as string || "-"}</td>
                  )}
                  {table === "books" && (
                    <td style={tdStyle}>{item.year as string || "-"}</td>
                  )}
                  {table === "articles" && (
                    <td style={tdStyle}>
                      {(item.excerpt as string)?.slice(0, 50) || "-"}
                    </td>
                  )}
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: item.published ? "#2ecc71" : "#e74c3c",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {item.published ? "منشور" : "مسودة"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "#999", fontSize: "0.85rem" }}>
                    {formatDate(item.created_at as string)}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => onEdit(item)}
                        style={actionBtnStyle}
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => onDelete(item.id as string)}
                        disabled={deleting === item.id}
                        style={{ ...actionBtnStyle, backgroundColor: "#8B0000" }}
                      >
                        {deleting === item.id ? "..." : "حذف"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ModalForm({
  mode,
  table,
  item,
  saving,
  onSave,
  onClose,
}: {
  mode: FormMode;
  table: TableName;
  item: Record<string, unknown> | null;
  saving: boolean;
  onSave: (fields: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    if (mode === "edit" && item) {
      return { ...item };
    }
    return getDefaultForm(table);
  });

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const title = mode === "add"
    ? `إضافة ${tableLabels[table]}`
    : `تعديل ${tableLabels[table]}: ${(item?.title as string)?.slice(0, 30) || ""}`;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h3 style={{ color: "#C9A84C", margin: 0, fontSize: "1.25rem" }}>
            {title}
          </h3>
          <button onClick={onClose} style={closeBtnStyle}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          {renderFormFields(table, form, handleChange)}
          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>
              إلغاء
            </button>
            <button type="submit" disabled={saving} style={saveBtnStyle}>
              {saving ? "جاري الحفظ..." : mode === "add" ? "إضافة" : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getDefaultForm(table: TableName): Record<string, unknown> {
  switch (table) {
    case "lectures":
      return { title: "", description: "", media_url: "", published: false };
    case "sermons":
      return { title: "", description: "", media_url: "", published: false };
    case "books":
      return { title: "", description: "", cover_url: "", pdf_url: "", publisher: "", year: "", published: false };
    case "articles":
      return { title: "", content: "", excerpt: "", cover_url: "", tags: "", published: false };
  }
}

function renderFormFields(
  table: TableName,
  form: Record<string, unknown>,
  onChange: (key: string, value: unknown) => void,
) {
  const handleTextField = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => onChange(key, e.target.value);

  const handleNumberField = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => onChange(key, e.target.value ? parseInt(e.target.value) : "");

  const handleToggle = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => onChange(key, e.target.checked);

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#f5f0e8",
    fontSize: "0.95rem",
    fontFamily: "var(--font-noto)",
    outline: "none",
    boxSizing: "border-box",
  };

  const textareaStyle: React.CSSProperties = {
    ...fieldStyle,
    minHeight: "120px",
    resize: "vertical",
  };

  const labelStyle: React.CSSProperties = {
    color: "#C9A84C",
    fontSize: "0.9rem",
    fontWeight: 600,
    fontFamily: "var(--font-noto)",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  };

  switch (table) {
    case "lectures":
      return (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>العنوان *</label>
            <input
              style={fieldStyle}
              value={form.title as string}
              onChange={handleTextField("title")}
              required
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>الوصف</label>
            <textarea
              style={textareaStyle}
              value={form.description as string}
              onChange={handleTextField("description")}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>الرابط</label>
            <input
              style={fieldStyle}
              value={form.media_url as string}
              onChange={handleTextField("media_url")}
              placeholder="رابط يوتيوب أو تسجيل صوتي"
            />
          </div>
          <div style={rowStyle}>
            <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={!!form.published}
                onChange={handleToggle("published")}
              />
              منشور
            </label>
          </div>
        </>
      );

    case "sermons":
      return (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>العنوان *</label>
            <input
              style={fieldStyle}
              value={form.title as string}
              onChange={handleTextField("title")}
              required
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>الوصف</label>
            <textarea
              style={textareaStyle}
              value={form.description as string}
              onChange={handleTextField("description")}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>الرابط</label>
            <input
              style={fieldStyle}
              value={form.media_url as string}
              onChange={handleTextField("media_url")}
              placeholder="رابط يوتيوب أو تسجيل صوتي"
            />
          </div>
          <div style={rowStyle}>
            <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={!!form.published}
                onChange={handleToggle("published")}
              />
              منشور
            </label>
          </div>
        </>
      );

    case "books":
      return (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>العنوان *</label>
            <input
              style={fieldStyle}
              value={form.title as string}
              onChange={handleTextField("title")}
              required
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>الوصف</label>
            <textarea
              style={textareaStyle}
              value={form.description as string}
              onChange={handleTextField("description")}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>رابط الغلاف</label>
            <input
              style={fieldStyle}
              value={form.cover_url as string}
              onChange={handleTextField("cover_url")}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>رابط PDF</label>
            <input
              style={fieldStyle}
              value={form.pdf_url as string}
              onChange={handleTextField("pdf_url")}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>الناشر</label>
            <input
              style={fieldStyle}
              value={form.publisher as string}
              onChange={handleTextField("publisher")}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>سنة النشر</label>
            <input
              style={fieldStyle}
              type="number"
              value={form.year as string}
              onChange={handleNumberField("year")}
            />
          </div>
          <div style={rowStyle}>
            <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={!!form.published}
                onChange={handleToggle("published")}
              />
              منشور
            </label>
          </div>
        </>
      );

    case "articles":
      return (
        <>
          <div style={rowStyle}>
            <label style={labelStyle}>العنوان *</label>
            <input
              style={fieldStyle}
              value={form.title as string}
              onChange={handleTextField("title")}
              required
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>المحتوى *</label>
            <textarea
              style={textareaStyle}
              value={form.content as string}
              onChange={handleTextField("content")}
              required
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>المقتطف</label>
            <textarea
              style={{ ...textareaStyle, minHeight: "80px" }}
              value={form.excerpt as string}
              onChange={handleTextField("excerpt")}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>رابط الغلاف</label>
            <input
              style={fieldStyle}
              value={form.cover_url as string}
              onChange={handleTextField("cover_url")}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>الوسوم (مفصولة بفواصل)</label>
            <input
              style={fieldStyle}
              value={form.tags as string}
              onChange={handleTextField("tags")}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div style={rowStyle}>
            <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={!!form.published}
                onChange={handleToggle("published")}
              />
              منشور
            </label>
          </div>
        </>
      );
  }
}

const pageStyle: React.CSSProperties = {
  padding: "2rem",
  fontFamily: "var(--font-amiri)",
  backgroundColor: "#0a0a0a",
  minHeight: "100vh",
  color: "#f5f0e8",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
};

const headingStyle: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "#C9A84C",
  margin: 0,
};

const logoutBtnStyle: React.CSSProperties = {
  padding: "0.5rem 1.25rem",
  backgroundColor: "transparent",
  border: "1px solid #C9A84C",
  color: "#C9A84C",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontFamily: "var(--font-noto)",
  fontWeight: 600,
};

const tabBtnStyle: React.CSSProperties = {
  padding: "0.6rem 1.25rem",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.95rem",
  fontWeight: 600,
  fontFamily: "var(--font-amiri)",
  transition: "all 0.2s",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "1.5rem",
  marginBottom: "3rem",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#111111",
  border: "1px solid rgba(201, 168, 76, 0.3)",
  borderRadius: "12px",
  padding: "1.5rem",
  textAlign: "center",
};

const iconStyle: React.CSSProperties = {
  fontSize: "2.5rem",
  marginBottom: "0.5rem",
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#C9A84C",
  marginBottom: "1rem",
};

const statsRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.25rem 0",
  fontSize: "0.95rem",
};

const statLabelStyle: React.CSSProperties = {
  color: "#f5f0e8",
};

const statValueStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#f5f0e8",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#C9A84C",
  margin: 0,
};

const listStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const itemRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  backgroundColor: "#111111",
  border: "1px solid #222",
  borderRadius: "8px",
  padding: "0.85rem 1rem",
  color: "#f5f0e8",
};

const itemTitleStyle: React.CSSProperties = {
  flex: 1,
  fontSize: "1rem",
  fontWeight: 600,
};

const itemDateStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#999",
  whiteSpace: "nowrap",
};

const badgeStyle: React.CSSProperties = {
  backgroundColor: "rgba(201, 168, 76, 0.15)",
  color: "#C9A84C",
  padding: "0.25rem 0.65rem",
  borderRadius: "4px",
  fontSize: "0.8rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const emptyStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#666",
  fontSize: "1rem",
  padding: "2rem 0",
};

const tableHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
  borderBottom: "2px solid #C9A84C",
  paddingBottom: "0.5rem",
};

const addBtnStyle: React.CSSProperties = {
  padding: "0.6rem 1.5rem",
  backgroundColor: "#C9A84C",
  color: "#0a0a0a",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "var(--font-amiri)",
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.9rem",
};

const thStyle: React.CSSProperties = {
  textAlign: "right",
  padding: "0.75rem 1rem",
  backgroundColor: "#1a1a1a",
  color: "#C9A84C",
  fontWeight: 700,
  borderBottom: "2px solid #C9A84C",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #222",
  color: "#f5f0e8",
};

const trStyle: React.CSSProperties = {
  transition: "background 0.2s",
};

const actionBtnStyle: React.CSSProperties = {
  padding: "0.35rem 0.75rem",
  backgroundColor: "#C9A84C",
  color: "#0a0a0a",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 600,
  fontFamily: "var(--font-noto)",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1rem",
};

const modalContainerStyle: React.CSSProperties = {
  backgroundColor: "#111111",
  border: "1px solid rgba(201, 168, 76, 0.3)",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid #222",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#999",
  fontSize: "1.25rem",
  cursor: "pointer",
};

const formContainerStyle: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  overflowY: "auto",
};

const modalFooterStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  gap: "0.75rem",
  paddingTop: "0.5rem",
  borderTop: "1px solid #222",
  marginTop: "0.5rem",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "0.65rem 1.5rem",
  backgroundColor: "transparent",
  border: "1px solid #555",
  color: "#f5f0e8",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.95rem",
  fontFamily: "var(--font-noto)",
};

const saveBtnStyle: React.CSSProperties = {
  padding: "0.65rem 1.5rem",
  backgroundColor: "#C9A84C",
  color: "#0a0a0a",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "var(--font-amiri)",
};
