# Deployment — Railway

Both the Django API and Next.js client are deployed as separate services in the same Railway project. The database is SQLite on a persistent volume.

---

## Architecture

| Service            | Runtime           | Notes                                     |
| ------------------ | ----------------- | ----------------------------------------- |
| `paw-watch-api`    | Python / gunicorn | Web service, persistent volume at `/data` |
| `paw-watch-client` | Node.js           | Next.js standalone build                  |
| Cron (optional)    | —                 | Runs `reset_demo` on a schedule           |

---

## First-time setup

### 1. Create a Railway project

1. Go to [railway.app](https://railway.app) and create a new project.
2. Add two services — one for the API, one for the client. Connect both to the GitHub repo.

### 2. Configure the API service

**Root directory:** `code/paw-watch-api`  
**Start command:** auto-detected from `Procfile` → `gunicorn pawwatch.wsgi`

**Attach a persistent volume:**

- In the API service settings, add a volume mounted at `/data`
- This keeps `db.sqlite3` alive across deploys (but not uploaded pictures in the media folder)

**Environment variables:**

| Variable               | Value                                                                    |
| ---------------------- | ------------------------------------------------------------------------ |
| `DJANGO_SECRET_KEY`    | A long random string (50+ chars)                                         |
| `DEBUG`                | `false`                                                                  |
| `ALLOWED_HOSTS`        | Your Railway API domain (e.g. `paw-watch-api.up.railway.app`)            |
| `CORS_ALLOWED_ORIGINS` | Your Railway client URL (e.g. `https://paw-watch-client.up.railway.app`) |
| `DB_PATH`              | `/data/db.sqlite3`                                                       |

**After the first deploy** — initialise the database via the Railway shell:

```bash
./seed_data.sh
```

This wipes any existing DB, runs migrations, and loads all fixture data (users, labels, posts).

### 3. Configure the client service

**Root directory:** `code/paw-watch-client`  
**Build command:** `npm run build`  
**Start command:** `npm run start`

**Environment variables:**

| Variable                   | Value                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`      | Full URL of the Railway API service (e.g. `https://paw-watch-api.up.railway.app/api`) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Your Mapbox token (`pk.…`)                                                            |

**To create a mapbox token:**

- Visit https://console.mapbox.com/account/access-tokens/
- Create a new token
- Give it a name
- Select `STYLES:TILES` as the public scope
- add a URL (e.g. `https://paw-watch.up.railway.app`)

---

## Redeployment

Both services redeploy automatically on push to the connected branch. No manual steps needed unless env vars change.

---

## Resetting the demo data

Run this from the Railway shell on the API service:

```bash
./seed_data.sh
```

This drops the SQLite file, re-runs migrations, and reloads all fixtures. Takes about 5 seconds.

---

## Seed accounts

| Email               | Password  | Role  |
| ------------------- | --------- | ----- |
| `admin@example.com` | `test123` | Admin |
| `tom@example.com`   | `test123` | User  |
| `jane@example.com`  | `test123` | User  |

---
