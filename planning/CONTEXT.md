# PawWatch Clarksville — Lost & Found Pets

**Codename:** paw-watch

A community website for Clarksville, TN where residents can post and track lost and found pets. Users pin locations on a map, follow up with sighting comments, and mark cases as resolved.

---

## Problem

When a pet goes missing or is found, there is no centralized local platform to coordinate the search. Posts scatter across Facebook groups, Nextdoor, and flyers. PawWatch Clarksville gives the city one focused place to post, search, and reunite pets with their owners.

---

## Users

- **Registered community members** — post lost/found pets, comment with sightings, update status
- **Stretch: Shelters & rescues** — verified accounts that can claim found animals and post intake notices

Registration is required to browse, post, or comment. The site is fully gated — no public access.

---

## Core Features (MVP)

### Pet Listings
- Post type: **Lost** or **Found**
- Fields: pet name, species, breed, color, description, photo(s), date of incident
- Map pin: user drops a pin on a city map for where the pet was last seen / found
- Status: `Active`, `Sighting Reported`, `Reunited`, `Closed`

### Map View
- City-scoped interactive map showing all active listings as pins
- Pin color/icon differs by type (lost vs. found)
- Clicking a pin opens a preview card with a link to the full listing

### Comments / Sightings
- Any registered user can comment on a listing
- Comment can optionally include a map pin (sighting location)
- Comment can optionally include attached photos
- Owner can mark a comment as a confirmed sighting, which updates listing status

### Status Updates
- Listing owner can update status at any time
- `Reunited` triggers a visual celebration state on the listing (e.g. banner)
- Closed listings are archived and hidden from the main map but remain accessible via direct link or search

### Auth
- Email + password registration
- No email verification or password reset (MVP)

---

## Stretch Goals

- **Shelter/rescue verified accounts** — special account type, can post on behalf of a shelter, badge shown on listings
- **Push/email notifications** — notify listing owner when a comment or sighting is added
- **Search & filters** — filter map/list by species, date range, status, neighborhood
- **Social share** — one-click share card for a listing (OG image with pet photo + details)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Map | Leaflet.js (OpenStreetMap tiles) |
| Backend API | Django + Django REST Framework |
| Database | SQLite (dev/MVP), migratable to Postgres |
| Auth | Django auth + DRF token or SimpleJWT |
| Image storage | Local disk (dev), S3-compatible (prod) |
| Deployment | TBD |

---

## Data Model (Draft)

```
User
  id, email, password_hash, display_name, avatar, role (member | shelter | admin)

Post
  id, owner (FK User), type (lost | found), status
  pet_name, species, breed, color, description
  incident_date, created_at, updated_at
  location_lat, location_lng, location_label

Comment
  id, post (FK Post), author (FK User)
  body, created_at
  sighting_lat, sighting_lng (optional)
  is_confirmed_sighting (bool)

Photo
  id, file_path, order, uploaded_at

PostPhoto
  post (FK Post), photo (FK Photo)

CommentPhoto
  comment (FK Comment), photo (FK Photo)
```

---

## Decisions

- Map is centered on Clarksville, TN by default with no hard boundary restriction — users can pan freely
- Photo upload limits — suggested: 4 photos per listing, 2 per comment, 5MB each

---

## Reference Repos

These example repos define the expected folder structure and coding patterns for this project.

- **API:** [Bangazon-api-hrmjnv](https://github.com/NSS-Day-Cohort-79/Bangazon-api-hrmjnv)
- **Client:** [Bangazon-client-hrmjnv](https://github.com/NSS-Day-Cohort-79/Bangazon-client-hrmjnv)

### API Structure (Django + DRF)

```
bangazon/              # Django project root
├── settings.py
├── urls.py            # Router registration — one line per ViewSet
└── wsgi.py

bangazonapi/           # Main app
├── models/
│   ├── __init__.py    # Re-exports all models
│   └── product.py     # One model per file
├── views/
│   ├── __init__.py    # Re-exports all ViewSets
│   └── product.py     # ViewSet + serializers co-located in same file
├── fixtures/          # Seed data JSON files
└── tests.py

manage.py
Pipfile
```

**Key patterns:**
- Each model lives in its own file under `models/`; `models/__init__.py` re-exports all of them
- Each ViewSet lives in its own file under `views/`; serializers are defined in the same file as the ViewSet that uses them
- URLs use DRF's `DefaultRouter` — register each ViewSet with `router.register(r'resource', ViewSet, 'basename')`
- Auth uses `@csrf_exempt` function-based views at `/login` and `/register` that return a `Token` key
- Registration creates both a Django `User` and a linked profile model (e.g. `Customer`) in one request
- Token auth: `Authorization: Token <token>` header on all protected requests
- Images use `ImageField(upload_to='subfolder')` stored under `media/`
- Soft-delete via `safedelete` library (`SafeDeleteModel`, `SOFT_DELETE` policy)

### Client Structure (Next.js Pages Router)

```
pages/
├── _app.js             # Wraps Component with per-page getLayout pattern
├── index.js
├── login.js
├── register.js
└── products/
    ├── index.js        # List page
    ├── new.js          # Create form
    └── [id]/
        ├── index.js    # Detail page
        └── edit.js     # Edit form

components/
├── layout.js           # Shell layout
├── navbar.js
├── modal.js
└── product/
    ├── card.js         # List item
    ├── detail.js       # Full detail view
    └── form.js         # Create/edit form

data/                   # API call functions — one file per resource
├── fetcher.js          # Base fetch wrappers (fetchWithResponse, fetchWithoutResponse)
├── auth.js             # login(), register(), getUserProfile()
└── products.js         # getProducts(), getProductById(), addProduct(), editProduct(), …

context/
└── state.js            # AppWrapper + useAppContext — holds token and profile in React context
```

**Key patterns:**
- All API calls go through `data/fetcher.js` which handles error checking and 401 redirect
- Each resource gets its own file in `data/` that imports from `fetcher.js`
- `Authorization: Token ${localStorage.getItem('token')}` added to every authenticated request
- Token stored in `localStorage`; fetched once in context on mount
- Per-page layouts via `Component.getLayout` pattern in `_app.js`
- Components are grouped by feature under `components/<feature>/` (e.g. `components/product/`)
