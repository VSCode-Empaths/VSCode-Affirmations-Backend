# Heroku → Fly + Supabase migration plan

**Goal:** Stop paying for Heroku (~$15/mo) on this bootcamp side project by hosting the **Express API on Fly.io** and the **database on Supabase (Postgres only)**. Minimal rewrite: keep Express, GitHub OAuth, cookies, and `pg` models; only change where the DB and app run.

**Chosen architecture**

| Layer | Target | Notes |
|--------|--------|--------|
| **API** | **Fly.io** | Same org/pattern as your other small Fly app: `shared-cpu-1x`, **256MB**, **auto-stop** when idle, health check on `GET /health`. |
| **Database** | **Supabase** | “Path A”: hosted Postgres only (no Supabase Auth/RLS rewrite). Schema is plain SQL (`sql/setup.sql`); app uses `node-pg` as today. |
| **Frontend** | Unchanged host (e.g. Netlify) | Update **API base URL**, **CORS**, and **GitHub OAuth** redirect/callbacks to the new API origin. |

**Cost / expectations:** Supabase Free tier is appropriate for this workload (tiny data, low traffic) if you stay within current quotas. Fly billing depends on your org (legacy free allowances vs pay-as-you-go); a small always-stopped-when-idle app is usually cheap. **Fly Managed Postgres was explicitly avoided** (expensive vs this use case).

---

## What changed in this repo (already done)

- **`Dockerfile` + `.dockerignore`** — Production image: Node 20, build deps for `bcrypt`, `npm ci --omit=dev`, port **3000** (matches `fly.toml` `internal_port`).
- **`fly.toml`** — App name placeholder `error-affirmations-api`, region `sjc`, Docker build, HTTP service on 3000, **auto_start_machines** / **auto_stop_machines**, health check **`GET /health`**, **256mb** shared CPU.
- **`lib/app.js`** — **`/health`** returns `{ ok: true }` (no DB) for Fly checks. **CORS** still lists Netlify + localhost; **add your `https://<app>.fly.dev` origin** after first deploy.
- **`lib/utils/pool.js`** — **TLS** for remote Postgres when `PGSSLMODE` is set or `DATABASE_URL` looks like Supabase / `sslmode=require`.
- **`lib/load-env.js`** — Loads **`.env`** then **`.env.local`**; **`dns.setDefaultResultOrder('ipv4first')`** to reduce IPv6 issues to some cloud DB hosts. Used by `npm start`, `start:watch`, `setup-db`, and Jest via `-r ./lib/load-env.js`.
- **`package.json`** — Start/setup-db scripts use **`load-env.js`** (not raw `dotenv/config` only). Removed Heroku-only **`setup-heroku`** script.
- **`env.example`** — Documents vars for Supabase + Fly (including `PGSSLMODE`, GitHub, cookies, `API_URL`).
- **`README.md`** — Short Fly + Supabase checklist (per your session).
- **`.gitignore`** — Ignores **`.env.local`** / `*.local` so secrets are not committed.

**Tooling (your machine, not all in repo):** Supabase **CLI** and **MCP** (project-scoped URL optional), optional **Supabase agent skills**. **Fly MCP** was intentionally not used; **`fly` CLI** is enough.

---

## Cutover checklist (order matters)

1. **Supabase project** — Create if needed. Apply schema: **SQL Editor** → run `sql/setup.sql`, *or* `npm run setup-db` with `DATABASE_URL` (and `PGSSLMODE` if needed) in **`.env` / `.env.local`**. For **first-time empty DB**, full setup is correct (script may `DROP` then recreate).  
2. **Connection string** — Prefer **Session pooler URI** if **Direct** fails locally (e.g. IPv6). Ensure **real DB password** is in the URI (not a placeholder). Same string will go to **Fly secrets** for production.  
3. **Fly app name** — Ensure **`fly.toml` `app`** is globally unique; create app if needed (`fly apps create <name>` or `fly launch`).  
4. **Fly secrets** — Set everything the app needs (at minimum `DATABASE_URL`, `PGSSLMODE=require` if you use it, `JWT_SECRET`, `SALT_ROUNDS`, `COOKIE_NAME`, **`SECURE_COOKIES=true`** (required when the web app is on another HTTPS origin so session cookies are sent on credentialed API calls; if omitted/false, GitHub OAuth can appear to work while `/api/v1/users/me` returns **401**), `GH_*`, `REDIRECT_URL`, **`API_URL=https://<app>.fly.dev`**, etc.). **Do not commit secrets;** `fly secrets set` locally or via CI. **Do not set `PORT` in secrets** — Fly sets it to match the service.  
5. **Deploy** — `fly deploy` from repo root.  
6. **CORS** — Add production **`https://<app>.fly.dev`** to `origin` in `lib/app.js`, redeploy.  
7. **GitHub OAuth app** — Update **authorization callback** URL(s) to the new API.  
8. **Frontend (e.g. Netlify)** — Point **API base URL** env to the Fly URL.  
9. **Smoke test** — `GET /health`, then a real API route and **login** if you use GitHub.  
10. **Heroku** — Remove Postgres add-on and delete/scale the app so billing stops.

---

## You vs agent / automation

| Task | You (account + secrets in browser) | Agent / CLI |
|------|------------------------------------|------------|
| Create Supabase project, reset DB password | Yes | — |
| Copy connection string into **`.env.local`** / **`fly secrets`** (values) | Yes (avoid pasting full secrets in chat) | Can draft **names** and commands |
| Run `npm run setup-db` or paste SQL in SQL Editor | Either | Can run `setup-db` if env is present |
| `fly auth login` | One-time | — |
| `fly apps create` / `fly deploy` / `fly logs` | — | Can run in terminal if logged in |
| Patch **CORS** / `fly.toml` `app` | — | Yes (needs final hostname) |
| GitHub OAuth + Netlify env | Yes | — |
| Decommission Heroku | Yes | — |
| **Supabase MCP** (tables, SQL) | Connect/auth in Cursor | Use **`mcp_auth`** first if required, then tools |

**Note:** The **Docker `CMD`** may still use `dotenv/config`; on Fly, configuration comes from **runtime env** (secrets), not files in the image, which is normal.

---

## If something goes wrong

- **Local DB connection:** Try **Session pooler** string; confirm password; check VPN/firewall.  
- **Prod DB from Fly:** Often **Direct** works even when a laptop had issues; if not, switch secret to **Session pooler** URI.  
- **Health check failing:** Ensure **`GET /health`** is registered **before** heavy middleware and returns 200 without DB.  
- **CORS or OAuth:** New API hostname must be in **CORS `origin`**, **GitHub callback**, and **client `API_URL`**.
- **401 on `/users/me` after GitHub login:** On Fly, set **`SECURE_COOKIES=true`** and redeploy. The SPA on Netlify calls the API cross-site; `SameSite=Lax` cookies are not sent on those requests, so the session never reaches `/api/v1/users/me`.

---

## Out of scope (unless you change product direction)

- **Path B:** Replace custom auth with **Supabase Auth + RLS + client SDK** — larger refactor, not required to leave Heroku.  
- **Fly Managed Postgres** — Not chosen; use Supabase/Neon-style external Postgres instead.

This document summarizes the working notes from your Cursor session on this migration; keep it in the repo as the single **“what we’re doing and what’s left”** reference.
