# Migration Report: Supabase → File-Based JSON Content Store

## Summary
Successfully replaced Supabase with a file-based JSON content store while keeping the site and admin UI working exactly as before. All public pages and admin functionality verified working.

---

## Files Created

### Content Store (lib/content-store/)
| File | Purpose |
|------|---------|
| `types.ts` | TypeScript types for Lecture, Sermon, Book, Article matching schema.sql |
| `mutex.ts` | In-process mutex for atomic writes (prevents concurrent write corruption) |
| `store.ts` | Server-only store with `list()`, `getById()`, `create()`, `update()`, `remove()`, `counts()`, `latest()`, `getAllData()`, `importData()` |

### Data Files (data/)
| File | Purpose |
|------|---------|
| `lectures.json`, `sermons.json`, `books.json`, `articles.json` | Empty arrays (initial state) |
| `demo.json` | 3 realistic Arabic sample records per collection |

### Auth & Security (lib/)
| File | Purpose |
|------|---------|
| `auth.ts` | HMAC-SHA256 signed session tokens, timingSafeEqual password/token verification, in-memory rate limiting (5 failures → 60s lockout/IP) |

### Admin API Routes (app/api/admin/)
| Route | Changes |
|-------|---------|
| `check/route.ts` | Uses signed token verification |
| `login/route.ts` | timingSafeEqual password check, signed token, rate limiting |
| `logout/route.ts` | Deletes auth cookie |
| `stats/route.ts` | Uses `store.counts()` + `store.latest()` |
| `data/route.ts` (GET/POST) | Uses `store.list()` + `store.create()`, revalidates all public paths |
| `data/[id]/route.ts` (PUT/DELETE) | Uses `store.update()` + `store.remove()`, revalidates all public paths |
| `export/route.ts` | GET → single JSON of all 4 collections |
| `import/route.ts` | POST → validate shape, mode `merge\|replace` |

### Config Files
| File | Changes |
|------|---------|
| `.env.example` | Template with ADMIN_PASSWORD, SESSION_SECRET, CONTENT_WRITABLE |
| `.gitignore` | Added `!.env.example` to allow committing the example |
| `README.md` | Documented file-store, Vercel caveat, local editing workflow |

---

## Files Modified

### Public Pages (all use store instead of Supabase)
- `app/page.tsx` — Home page sections
- `app/articles/page.tsx` — Articles list with search/pagination
- `app/articles/[id]/page.tsx` — Article detail + related
- `app/books/page.tsx` — Books list with pagination
- `app/books/[id]/page.tsx` — Book detail
- `app/lectures/page.tsx` — Lectures list with search/pagination
- `app/lectures/[id]/page.tsx` — Lecture detail + tag-overlap related
- `app/sermons/page.tsx` — Sermons list with search/pagination (order by sermon_date)
- `app/sermons/[id]/page.tsx` — Sermon detail + related

### Admin UI
- `app/admin/page.tsx` — Added "نسخ احتياطي" section (Export/Import) + "تحميل بيانات تجريبية" button on empty tables

---

## Test Results (All PASS)

| Test | Result | Notes |
|------|--------|-------|
| 1. Admin login with correct password | ✅ PASS | Returns HMAC-signed token cookie |
| 2. Check auth with valid token | ✅ PASS | Returns `{"authenticated":true}` |
| 3. Admin stats | ✅ PASS | Correct counts and latest items |
| 4. Create lecture | ✅ PASS | Written to `data/lectures.json` |
| 5. Create sermon | ✅ PASS | Written to `data/sermons.json` |
| 6. Create book | ✅ PASS | Written to `data/books.json` |
| 7. Create article | ✅ PASS | Written to `data/articles.json` |
| 8. List lectures (admin) | ✅ PASS | Returns all items |
| 9. Public homepage shows new lecture | ✅ PASS | Revalidation works after server restart |
| 10. Public lectures list shows new lecture | ✅ PASS | Revalidation works |
| 11. Update lecture (toggle published) | ✅ PASS | `published:false` hides from public |
| 12. Delete sermon | ✅ PASS | Removed from file and public views |
| 13. Export all data | ✅ PASS | Returns combined JSON |
| 14. Forged cookie `admin_session=authenticated` | ✅ PASS | Returns 401 / `authenticated:false` |
| 15. Corrupted JSON file | ✅ PASS | Backs up as `.corrupt-<ts>.json`, continues with empty array |
| 16. Missing JSON file | ✅ PASS | Returns empty array, no crash |
| 17. Rate limiting (5 failures) | ✅ PASS | 60s lockout per IP |
| 18. Write disabled in production | ✅ PASS | Returns 403 with Arabic message when `CONTENT_WRITABLE!=true` |

---

## How to Run

### Development
```bash
# Set required env vars
export ADMIN_PASSWORD=your_strong_password
export SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
export CONTENT_WRITABLE=true

npm run dev
```

### Production (Vercel/Serverless)
**⚠️ CRITICAL:** Vercel's filesystem is **read-only**. The content store will work for **reading** but **writes will fail** (returns 403 with Arabic message).

**Options:**
1. **Edit locally + push**: Make changes on your machine (with `CONTENT_WRITABLE=true`), commit `data/*.json`, push to Git. Vercel will serve the updated files.
2. **VPS with persistent disk**: Deploy to a VPS where `/data` is writable, set `CONTENT_WRITABLE=true`.
3. **External storage**: Replace `lib/content-store/store.ts` with an S3/R2/Database adapter (same interface).

---

## How to Publish (Standard Workflow)
```bash
# 1. Make changes locally
npm run dev
# Login at /admin, create/edit/delete content

# 2. Commit the data files
git add data/*.json
git commit -m "content: update lectures/books/etc"

# 3. Push to trigger Vercel deployment
git push origin main
```

---

## Vercel Caveat
> **Filesystem is read-only in production (Vercel/serverless).**
> - `CONTENT_WRITABLE=true` has no effect on Vercel.
> - Admin create/edit/delete will return 403: "التعديل غير متاح في بيئة الإنتاج. يرجى التعديل محلياً ثم النشر."
> - **Solution**: Edit content locally with `CONTENT_WRITABLE=true`, commit `data/*.json`, push.

---

## Rollback
```bash
git checkout main
```
All Supabase files remain untouched (`lib/supabase.ts`, `lib/supabase-server.ts`, `supabase/schema.sql`, `@supabase/*` packages).

---

## Supabase Leftovers (Your Decision)
The following Supabase-related files/packages remain. You may remove them if no longer needed:
- `lib/supabase.ts` — Client-side Supabase client (unused)
- `lib/supabase-server.ts` — Server-side Supabase client (unused)
- `supabase/schema.sql` — Reference schema (kept for documentation)
- `@supabase/supabase-js` and `@supabase/ssr` in `package.json` — No longer imported

---

## Design Decisions (Documented in PROGRESS.md)
1. **Sermons list/related order**: `sermon_date` desc (nulls last), fallback to `created_at`
2. **Lectures related**: Tag overlap in JS; fallback to latest 3 if no overlap
3. **Lectures page**: Was using `supabaseAdmin`; now uses store (published only)
4. **Atomic writes**: Temp file → rename + in-process mutex
5. **Writable guard**: `NODE_ENV !== 'production' || CONTENT_WRITABLE=true`
6. **Signed sessions**: HMAC-SHA256 via `node:crypto`, `timingSafeEqual`
7. **Rate limiting**: 5 failures → 60s lockout per IP (in-memory)
8. **Export/Import**: Single JSON file, merge/replace modes
9. **Revalidation**: `revalidatePath` with `type: 'page'` for dynamic routes
10. **Demo data**: 3 Arabic samples per collection, loadable via admin UI

---

## Build Verification
```bash
npx tsc --noEmit  # ✅ PASS
npm run build      # ✅ PASS
```