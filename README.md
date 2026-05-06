# PawWatch Clarksville

A community website for Clarksville, TN where residents can post and track lost and found pets. Users pin locations on a map, follow up with sighting comments, and mark cases as resolved.

## Features

- Post lost or found pet listings with photos, location pins, and status tracking
- Interactive city map showing all active listings
- Comment on listings with optional sighting locations
- Status progression: Active → Sighting Reported → Reunited / Closed
- Label tagging (Urgent, Injured, Microchipped, etc.)
- Admin controls for label management and content moderation

## Tech Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| Frontend      | Next.js 16 (App Router), Tailwind CSS  |
| Map           | Leaflet.js (OpenStreetMap tiles)       |
| Backend API   | Django + Django REST Framework         |
| Auth          | SimpleJWT (access + refresh tokens)    |
| Database      | SQLite (dev)                           |
| Image Storage | Local disk (`media/`)                  |

## Project Structure

```
paw-watch/
├── planning/               # Specs, ERD, wireframes, user stories, roadmap
├── code/
│   ├── paw-watch-api/      # Django REST API
│   └── paw-watch-client/   # Next.js client
└── ops/                    # Deployment and operations
```

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- [pipenv](https://pipenv.pypa.io/)
- Node.js 20+ and npm

---

### 1. API (`code/paw-watch-api`)

```bash
cd code/paw-watch-api

# Install dependencies
pipenv install

# Set up the database and load seed data
pipenv run python manage.py migrate
pipenv run python manage.py loaddata users posts labels post_labels

# Start the dev server (runs on http://localhost:8000)
pipenv run python manage.py runserver
```

To reset the database from scratch (re-runs migrations and reloads all fixtures):

```bash
bash seed_data.sh
```

#### Seed accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `password123` | Admin |
| `john@example.com` | `password123` | User |
| `jane@example.com` | `password123` | User |

#### Running tests

```bash
pipenv run python manage.py test api
```

---

### 2. Client (`code/paw-watch-client`)

```bash
cd code/paw-watch-client

# Install dependencies
npm install

# Copy environment config (already present — API URL points to localhost:8000)
# .env.local contains: NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start the dev server (runs on http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The API must be running for the client to work.

---

### Running both together

Start each in a separate terminal:

```bash
# Terminal 1 — API
cd code/paw-watch-api && pipenv run python manage.py runserver

# Terminal 2 — Client
cd code/paw-watch-client && npm run dev
```
