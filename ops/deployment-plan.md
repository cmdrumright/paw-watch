# Deployment Plan

> **This is a demo deployment.** SQLite is used instead of Postgres. The database resets every 24 hours via a scheduled Railway cron job. Not suitable for production use with real user data.

---

## Hosting

**Frontend (Next.js):** Railway
- Deployed as a Railway service from the same project as the API

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
- [x] Create Railway project
- [x] Add a persistent volume to the web service, mounted at `/data`
- [x] Set all env vars in Railway dashboard
- [x] Connect GitHub repo to Railway for auto-deploy on push
- [x] Frontend deployed on Railway
- [x] Set `NEXT_PUBLIC_API_URL` in frontend service env vars
- [x] Set `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to deployed domains
- [ ] Add daily reset cron job — deferred, reset manually via Railway shell: `python manage.py reset_demo`

### App (first deploy)
- [x] Run `python manage.py reset_demo` to initialize the DB
- [x] Verify fixture data loaded (users, labels, posts)
- [x] Verify media files served correctly

---

## Environment Variables

### Django (Railway)
| Variable | Description |
|---|---|
| `DJANGO_SECRET_KEY` | Random 50+ char secret |
| `DEBUG` | `false` |
| `ALLOWED_HOSTS` | Railway-assigned domain |
| `CORS_ALLOWED_ORIGINS` | Railway frontend service URL |
| `DB_PATH` | `/data/db.sqlite3` (matches the Railway persistent volume mount point) |

### Next.js (Railway)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full URL of the Railway Django API service |
