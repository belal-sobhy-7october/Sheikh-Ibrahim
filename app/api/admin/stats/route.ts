import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const tables = [
  { key: "lectures", label: "المحاضرات", icon: "📚" },
  { key: "sermons", label: "الخطب", icon: "📖" },
  { key: "books", label: "الكتب", icon: "📕" },
  { key: "articles", label: "المقالات", icon: "📝" },
] as const;

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const countsPromises = tables.map(async (t) => {
    const { count: total } = await supabase
      .from(t.key)
      .select("*", { count: "exact", head: true });
    const { count: published } = await supabase
      .from(t.key)
      .select("*", { count: "exact", head: true })
      .eq("published", true);
    return { key: t.key, label: t.label, icon: t.icon, total: total ?? 0, published: published ?? 0 };
  });

  const counts = await Promise.all(countsPromises);

  const latestPromises = tables.map(async (t) => {
    const { data } = await supabase
      .from(t.key)
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (!data) return [];
    return data.map((item) => ({ ...item, typeLabel: t.label }));
  });

  const latestResults = await Promise.all(latestPromises);
  const latestItems = latestResults
    .flat()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return NextResponse.json({ counts, latestItems });
}
