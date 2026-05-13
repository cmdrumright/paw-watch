# PawWatch Clarksville

A community website for Clarksville, TN where residents can post and track lost and found pets. Users pin locations on a map, follow up with sighting comments, and mark cases as resolved.

## Features

- Post lost or found pet listings with photos, location pins, and status tracking
- Interactive map (Mapbox) showing all active listings
- Dark mode with system, light, and dark options
- Comment on listings with optional sighting locations
- Status progression: Active → Sighting Reported → Reunited / Closed
- Label tagging (Urgent, Injured, Microchipped, etc.)
- Admin controls for label management and content moderation

## Tech Stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Frontend      | Next.js (App Router), Tailwind CSS v4 |
| Map           | Leaflet.js + Mapbox raster tiles      |
| Backend API   | Django + Django REST Framework        |
| Auth          | SimpleJWT (access + refresh tokens)   |
| Database      | SQLite                                |
| Image Storage | Local disk (`media/`)                 |

## Project Structure

```
paw-watch/
├── planning/               # Specs, ERD, wireframes, user stories, roadmap
├── code/
│   ├── paw-watch-api/      # Django REST API
│   └── paw-watch-client/   # Next.js client
├── review/                 # Code review notes
└── ops/                    # Deployment and operations
```

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- [pipenv](https://pipenv.pypa.io/)
- Node.js 20+ and npm
- A [Mapbox](https://mapbox.com) account with a public token (`pk.…`)

---

### 1. API (`code/paw-watch-api`)

**Create `.env`** by copying the example:

```bash
cp code/paw-watch-api/.env.example code/paw-watch-api/.env
```

Edit `.env` for local development:

```env
DJANGO_SECRET_KEY=replace-with-a-long-random-string
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
# DB_PATH defaults to db.sqlite3 in the project root — leave unset for local dev
```

Then install dependencies, migrate, and load seed data:

```bash
cd code/paw-watch-api

pipenv install

./seed_data.sh

# Start the dev server (http://localhost:8000)
pipenv run python manage.py runserver
```

#### Resetting the database

To wipe the database and reload all fixtures from scratch:

```bash
./seed_data.sh
```

#### Seed accounts

| Email               | Password  | Role  |
| ------------------- | --------- | ----- |
| `admin@example.com` | `test123` | Admin |
| `tom@example.com`   | `test123` | User  |
| `jane@example.com`  | `test123` | User  |

#### Running tests

```bash
pipenv run python manage.py test api
```

---

### 2. Client (`code/paw-watch-client`)

**Create `.env.local`**:

```bash
cp code/paw-watch-client/.env.local.example code/paw-watch-client/.env.local
```

Edit `.env.local` and fill in your Mapbox public token:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

The Mapbox token only needs the `styles:tiles` scope.

Then install and start:

```bash
cd code/paw-watch-client

npm install

# Start the dev server (http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API must be running for the client to work.

---

### Running both together

Start each in a separate terminal:

```bash
# Terminal 1 — API
cd code/paw-watch-api && pipenv run python manage.py runserver

# Terminal 2 — Client
cd code/paw-watch-client && npm run dev
```
