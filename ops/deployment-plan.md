# Deployment Plan

> **This is a demo deployment.** SQLite is used instead of Postgres. The database resets every 24 hours via a scheduled Railway cron job. Not suitable for production use with real user data.

---

## Hosting

**Frontend (Next.js):** Vercel
- Zero-config Next.js deploy, CDN, preview URLs per branch
- Deploys from GitHub on push

**Backend (Django):** Railway (web service)
- Simple deploys from GitHub, env vars UI, no DevOps setup required

**Database:** SQLite on a Railway persistent volume
- Volume mounted at `/data` — keeps the DB alive between deploys and restarts
- Wiped and reseeded every 24 hours by a Railway cron job

**Daily reset:** Railway cron service
- Runs `python manage.py reset_demo` on a `0 0 * * *` schedule (midnight UTC)
- Drops the SQLite file, clears media, re-runs migrations, loads all fixtures

---

## Pre-Deploy Checklist

### Settings / Environment
- [x] Move `SECRET_KEY` to environment variable
- [x] Move `DEBUG` to environment variable
- [x] Move `ALLOWED_HOSTS` to environment variable
- [x] Move `CORS_ALLOWED_ORIGINS` to environment variable
- [x] Point `DATABASES` `NAME` at the persistent volume path (`/data/db.sqlite3`)

### Infrastructure
- [ ] Create Railway project
- [ ] Add a persistent volume to the web service, mounted at `/data`
- [ ] Add a second Railway service (cron type), same repo, command: `python manage.py reset_demo`, schedule: `0 0 * * *`
- [ ] Set all env vars in Railway dashboard (see table below)
- [ ] Connect GitHub repo to Railway for auto-deploy on push
- [ ] Create Vercel project, connect GitHub repo
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel env vars (Railway web service URL)
- [ ] Set `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to final deployed domains

### App (first deploy)
- [ ] Run `python manage.py reset_demo` once manually via Railway shell to initialize the DB
- [ ] Verify fixture data loaded (users, labels, posts)

---

## Environment Variables

### Django (Railway)
| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` | Random 50+ char secret |
| `DEBUG` | `false` |
| `ALLOWED_HOSTS` | Railway-assigned domain (e.g. `paw-watch-api.up.railway.app`) |
| `CORS_ALLOWED_ORIGINS` | Vercel frontend URL (e.g. `https://paw-watch.vercel.app`) |
| `DB_PATH` | `/data/db.sqlite3` (matches the Railway persistent volume mount point) |

### Next.js (Vercel)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full URL of the Railway Django API |
