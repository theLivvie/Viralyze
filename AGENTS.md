# AGENTS.md

Next.js 16 + React 19 + TypeScript + Tailwind 4 + Supabase. AI-powered content prediction app ("Viralyze"). Deployed on Vercel.

## Commands

```bash
npm run dev      # next dev -p 3000
npm run build    # does NOT typecheck (see below)
npm run lint     # eslint .
npx tsc --noEmit # typecheck — no script exists, run this manually
```

- `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so a green build proves nothing about types. Always verify changes with `npx tsc --noEmit`.
- **There is no test framework or test script.** `tests/` holds leftover shell scripts from a sandbox scaffold, not a suite. Don't try to run tests.
- ESLint has most rules disabled (`eslint.config.mjs`) — lint passing is weak signal.

## Environment

`.env.local` (gitignored) copied from `.env.example`. Actual variable names the code uses:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (service role)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_SITE_URL` (OAuth)
- `Z_AI_API_KEY`, optional `Z_AI_BASE_URL` / `Z_AI_MODEL` (default model `glm-4.7-flash`)

Gotchas:
- **README's env section is stale** — it lists Prisma `DATABASE_URL` and old Supabase key names (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Trust `.env.example` plus the list above.
- `.env.example` omits the `Z_AI_*` vars even though every AI feature needs `Z_AI_API_KEY`.

## Architecture

**Single-route SPA.** All product UX lives in `src/app/page.tsx` (a `'use client'` page): landing sections and app views are swapped via Zustand state (`src/lib/store.ts`) with `next/dynamic` lazy loading. App features are components under `src/components/app/` (DashboardView, PredictView, etc.) — **not pages/routes**. The only real routes are `/api/*`.

- **AI layer:** server routes call `getZAI()` from `src/lib/zai.ts` — hand-rolled OpenAI-compatible fetch against the Z.ai Chat Completions API (the `z-ai-web-dev-sdk` dependency is legacy). Routes send strict "JSON only" system prompts and parse defensively; follow that pattern when adding AI endpoints.
- **Supabase:** two clients in `src/lib/supabase/` — `createClient()` (anon key, cookie session, respects RLS) vs `createAdminClient()` (service role, bypasses RLS — server API routes only). Session refresh runs through `src/middleware.ts`, matched on nearly every path.
- **Schema:** `supabase-schema.sql` is applied manually in the Supabase SQL Editor. There is no migration tooling — edit that file and re-run it when changing tables.
- **UI:** shadcn/ui "new-york" style, primitives in `src/components/ui/`, lucide icons, alias `@/*` → `src/*`. Theme is a custom wine/maroon dark theme defined in `src/app/globals.css`.

## Repo artifacts (don't trust them as current docs)

- `worklog.md`, `agent-ctx/`, `.zscripts/`, `mini-services/` are artifacts of a Z.ai cloud scaffold (build logs, agent work records, sandbox scripts).
- `worklog.md` describes a Prisma + SQLite data layer that **was replaced by Supabase** — historical record only.
