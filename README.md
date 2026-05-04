# PawWatch Clarksville

A community website for Clarksville, TN where residents can post and track lost and found pets. Users pin locations on a map, follow up with sighting comments, and mark cases as resolved.

## Features

- Post lost or found pet listings with photos, location pins, and status tracking
- Interactive city map showing all active listings
- Comment on listings with optional sighting locations
- Status progression: Active → Sighting Reported → Reunited / Closed

## Tech Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| Frontend      | Next.js (App Router), Tailwind CSS     |
| Map           | Leaflet.js (OpenStreetMap tiles)       |
| Backend API   | Django + Django REST Framework         |
| Database      | SQLite (dev), Postgres (prod)          |
| Auth          | DRF Token Auth                         |
| Image Storage | Local disk (dev), S3-compatible (prod) |

## Project Structure

```
paw-watch/
├── planning/       # Specs, ERD, wireframes, user stories, roadmap
├── code/
│   ├── paw-watch-api/      # Django API
│   └── paw-watch-client/   # Next.js client
├── docs/           # Documentation
└── ops/            # Deployment and operations
```

## Getting Started

Setup instructions will be added once development begins.
