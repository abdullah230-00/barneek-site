# Render Web App Deployment (Secure)

This app is a Vite + React SPA served by **nginx** (see `Dockerfile` and `nginx.conf`).

## 0) Prerequisites

- Render account
- Supabase project with:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` (only anon/public key)
- Ensure Supabase RLS is enabled and policies are set.

## 1) Build & containerize (locally)

> Do this locally to verify it works before pushing.

```bash
npm ci
npm run build
docker build . -t berniqairways-web:prod
```

## 2) Deploy on Render (recommended secure approach)

### Option A: Deploy as a Web Service (Docker)

1. In Render: **New** → **Web Service** → **Deploy from Docker image** (or Build from Docker)
2. Use:
   - **Runtime**: `docker`
   - **Dockerfile**: `Dockerfile`
   - **Build command**: (not needed if using Dockerfile build)
   - **Start command**: (not needed; nginx CMD is set in Dockerfile)
3. Set environment variables (only client-safe):
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key

> Security: do **not** use `service_role` keys in any env vars exposed to the browser.

### Option B: Deploy as Static Site

If you want a pure static deployment:
1. Run build locally: `npm run build`.
2. In Render: **New** → **Static Site**.
3. Set:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

> Note: This is simpler, but you lose the Docker/nginx CSP setup unless Render applies equivalent headers.

## 3) Security checklist (must-do)

- ✅ Use **RLS** in Supabase and verify policies.
- ✅ Use only **anon/public** Supabase key(s) in the frontend.
- ✅ CSP headers: already configured in `nginx.conf` (see `Content-Security-Policy`).
- ✅ Avoid committing `.env*` files.
- ✅ Rotate Supabase keys if they were ever exposed.

## 4) Minimal verification

After deployment, open the site and confirm:
- App loads
- Supabase requests succeed
- No console errors about CSP violations

## Files in this repo relevant to secure deploy

- `Dockerfile` (builds Vite → serves via nginx)
- `nginx.conf` (adds CSP + security headers)
- `DEPLOY_SECURE_FILES.md` (what not to upload)


