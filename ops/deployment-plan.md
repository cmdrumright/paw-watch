# Deployment Plan

## Hosting

**Frontend (Next.js):** Vercel
- Zero-config Next.js deploy, CDN, preview URLs per branch
- Deploys from GitHub on push

**Backend (Django):** Railway
- Simple deploys from GitHub, env vars UI, no DevOps setup required
- Postgres add-on available in the same project

**Database:** Railway Postgres
- Provisioned as an add-on within the Railway project
- Replaces SQLite for prod

---

## Pre-Deploy Checklist

### Settings / Environment
- [ ] Move `SECRET_KEY` to environment variable
- [ ] Move `DEBUG` to environment variable (default `false` in prod)
- [ ] Move `ALLOWED_HOSTS` to environment variable
- [ ] Move `CORS_ALLOWED_ORIGINS` to environment variable
- [ ] Add `DATABASE_URL` support (swap SQLite for Postgres in prod)
- [ ] Add S3-compatible storage config for media files (prod)

### Infrastructure
- [ ] Create Railway project, add Postgres add-on
- [ ] Set all env vars in Railway dashboard
- [ ] Connect GitHub repo to Railway for auto-deploy
- [ ] Create Vercel project, connect GitHub repo
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel env vars (pointing to Railway service URL)
- [ ] Set `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to final prod domains

### App
- [ ] Run `python manage.py migrate` on Railway after first deploy
- [ ] Load fixture data if needed (`labels.json`)
- [ ] Create an admin user in prod

---

## Environment Variables

### Django (Railway)
| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` | Random 50+ char secret |
| `DEBUG` | `false` |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hostnames |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list (Vercel frontend URL) |
| `DATABASE_URL` | Injected automatically by Railway Postgres add-on |
| `MEDIA_STORAGE` | `s3` or `local` — controls file backend |

### Next.js (Vercel)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full URL of the Railway Django API |
