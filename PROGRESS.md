# Progress Log

## Phase 0: Analysis - COMPLETE
- Confirmed all project facts
- Identified all Supabase touchpoints
- Created file plan
- Documented risks

## Phase 1: Content Store - COMPLETE
- Created lib/content-store/types.ts
- Created lib/content-store/mutex.ts
- Created lib/content-store/store.ts
- Created data/*.json files (empty arrays)
- Created data/demo.json with sample records
- Created .env.example
- Updated .gitignore to allow .env.example

## Phase 2: API Routes - COMPLETE
- Created lib/auth.ts with HMAC-SHA256 signed tokens, timingSafeEqual, rate limiting
- Rewrote app/api/admin/check/route.ts
- Rewrote app/api/admin/login/route.ts
- Rewrote app/api/admin/logout/route.ts
- Rewrote app/api/admin/stats/route.ts
- Rewrote app/api/admin/data/route.ts
- Rewrote app/api/admin/data/[id]/route.ts
- Created app/api/admin/export/route.ts
- Created app/api/admin/import/route.ts

## Phase 3: Security Fix - COMPLETE
- HMAC-SHA256 signed tokens with timingSafeEqual verification
- In-memory rate limiting (5 failures -> 60s lockout per IP)
- Admin password comparison with timingSafeEqual

## Phase 4: Public Pages - COMPLETE
- Updated app/page.tsx
- Updated app/articles/page.tsx
- Updated app/articles/[id]/page.tsx
- Updated app/books/page.tsx
- Updated app/books/[id]/page.tsx
- Updated app/lectures/page.tsx
- Updated app/lectures/[id]/page.tsx
- Updated app/sermons/page.tsx
- Updated app/sermons/[id]/page.tsx

## Phase 5: Verification - IN PROGRESS
- Updated admin page with backup/import section
- Build passes
- Now running manual tests...