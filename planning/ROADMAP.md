# PawWatch Clarksville — 1-Week Roadmap

**Start:** May 4, 2026
**Ship:** May 11, 2026

---

## Schedule Overview

| Day | Date | Focus |
|-----|------|-------|
| 1 | May 4 | Project setup + Auth |
| 2 | May 5 | Posts API (Django) |
| 3 | May 6 | Map & List views (Next.js) |
| 4 | May 7 | Create / Edit Post |
| 5 | May 8 | Comments & Sightings |
| 6 | May 9 | Status updates & owner controls |
| 7 | May 10 | Admin, polish & QA |
| Buffer | May 11 | Bug fixes & ship |

---

## Day 1 — Project Setup & Auth

### TICKET-001 · Initialize Django project
- Create Django project and `api` app
- Install and configure: `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `Pillow`
- Set up SQLite in `settings.py`
- Configure `CORS_ALLOWED_ORIGINS` for local Next.js dev server

### TICKET-002 · Initialize Next.js project
- Bootstrap with `create-next-app` using App Router and Tailwind
- Set up folder structure: `app/`, `components/`, `lib/`, `hooks/`
- Configure `.env.local` with `NEXT_PUBLIC_API_URL`
- Install `axios` or use native `fetch` with a base client helper

### TICKET-003 · Django User model + register endpoint
- Extend `AbstractUser` with `display_name`, `avatar_url`, `role` fields
- `POST /api/auth/register/` — create user, return JWT tokens
- Validate unique email on registration

### TICKET-004 · Django login endpoint
- `POST /api/auth/login/` — return access + refresh JWT tokens via SimpleJWT
- `POST /api/auth/refresh/` — refresh access token
- `POST /api/auth/logout/` — blacklist refresh token (enable token blacklist)

### TICKET-005 · Next.js Login page
- Build login form (email + password) matching wireframe
- On success: store access token (httpOnly cookie or memory) and redirect to map
- Show inline error on bad credentials

### TICKET-006 · Next.js Register page
- Build register form (display name + email + password) matching wireframe
- On success: auto-login and redirect to map
- Link between login ↔ register pages

### TICKET-007 · Auth guard middleware
- Next.js middleware redirects unauthenticated users to `/login` for all routes except `/login` and `/register`
- Attach JWT access token to all API requests via axios interceptor or fetch wrapper
- Handle 401 responses by clearing session and redirecting to login

---

## Day 2 — Posts API

### TICKET-008 · Post + Photo models
- `Post` model with all fields from ERD: `owner`, `type`, `status`, `pet_name`, `species`, `breed`, `color`, `description`, `incident_date`, `location_lat`, `location_lng`, `location_label`, `created_at`, `updated_at`
- `Photo` model: `file_path`, `order`, `uploaded_at`
- `PostPhoto` join table: `post`, `photo`
- Run and verify migrations

### TICKET-041 · Label + PostLabel models
- `Label` model: `name` (unique), `created_at`
- `PostLabel` join table: `post`, `label`
- Seed the 17 default labels: `Friendly`, `Shy / Timid`, `May Bite or Scratch`, `Good with Kids`, `Good with Other Pets`, `Needs Medication`, `Injured`, `Senior Pet`, `Deaf`, `Blind`, `Microchipped`, `Wearing Collar & Tags`, `Distinctive Markings`, `Neutered / Spayed`, `Reward Offered`, `Urgent`, `Near Busy Road`
- Run and verify migrations

### TICKET-042 · Labels API endpoints
- `GET /api/labels/` — return all labels (authenticated); used to populate the multi-select in the post form
- `POST /api/labels/` — admin only; create a new label
- `PATCH /api/labels/<id>/` — admin only; rename a label
- `DELETE /api/labels/<id>/` — admin only; delete label and detach from all posts (cascade delete `PostLabel` rows)
- Add `labels` field to Post serializer: list of label objects on read, list of label IDs on write

### TICKET-009 · Post list endpoint
- `GET /api/posts/` — return all active posts (exclude `reunited`, `closed` by default)
- Query param `?include_closed=true` to include all statuses
- Serializer includes first photo URL, comment count, owner display name

### TICKET-010 · Post detail endpoint
- `GET /api/posts/<id>/` — return full post with all photos and owner info

### TICKET-011 · Post create endpoint
- `POST /api/posts/` — authenticated only
- Accept multipart form data: post fields + up to 4 image files
- Save images to disk, create `Photo` records, link via `PostPhoto`
- Return created post

### TICKET-012 · Post update + delete endpoints
- `PATCH /api/posts/<id>/` — owner only, update any post fields
- `DELETE /api/posts/<id>/` — owner or admin only
- Return 403 for non-owners/non-admins

---

## Day 3 — Map & List Views

### TICKET-013 · Nav bar component
- Logo + site name on left
- Map / List view toggle in center
- `+ New Post` button and user dropdown menu on right
- Dropdown: display name, My Posts link, Log Out

### TICKET-014 · Map view page
- Install `leaflet` and `react-leaflet`
- Render Leaflet map centered on Clarksville, TN (`36.5298° N, 87.3595° W`), zoom level 12
- Fetch active posts from `GET /api/posts/` on load

### TICKET-015 · Post pins on map
- Render a pin per post at `location_lat` / `location_lng`
- Lost posts: red pin; Found posts: green pin
- Add legend overlay to map

### TICKET-016 · Pin preview card
- Clicking a pin opens a popup card: post type badge, pet name, species, status, first photo thumbnail, and a "View Post" link
- Clicking outside dismisses the card

### TICKET-017 · List view page
- Display posts as a vertical card list sorted by `created_at` descending
- Each card: type badge, status badge, first photo, pet name, species, breed, color, location label, date, comment count
- Clicking a card navigates to the post detail page

### TICKET-043 · Label pill display
- Render selected labels as small colored pills on list view cards (below the excerpt), on map pin preview cards, and on the post detail page (below the breed/color line)
- No labels shown if none were selected on the post
- Fetch label data from `GET /api/posts/<id>/` (already included in serializer from TICKET-042)

---

## Day 4 — Create / Edit Post

### TICKET-018 · Create post form — fields
- Form fields: post type toggle (Lost / Found), pet name, species dropdown, breed, color, description, date of incident
- Tailwind styling matching wireframe

### TICKET-044 · Label multi-select in post form
- Fetch available labels from `GET /api/labels/` on form load
- Render all labels as a checkbox grid (3 columns) matching wireframe
- Store selected label IDs in form state; submit as `label_ids` array alongside other post fields
- Pre-check saved labels when editing an existing post

### TICKET-019 · Photo upload UI
- Up to 4 image slots with `+` placeholders
- Preview selected images before submit
- Client-side file size validation (5MB max per photo)

### TICKET-020 · Map pin picker in post form
- Embed a small Leaflet map in the create form
- User clicks the map to drop a pin; coordinates + reverse label stored in form state
- Display the selected location label below the map

### TICKET-021 · Wire create form to API
- Submit form as `multipart/form-data` to `POST /api/posts/`
- On success: redirect to the new post's detail page
- Show validation errors inline

### TICKET-022 · Edit post page
- Reuse create form, pre-populated from `GET /api/posts/<id>/`
- Submit to `PATCH /api/posts/<id>/`
- Only accessible to post owner (redirect others)

### TICKET-023 · Delete post
- Delete button on post detail page (owner only)
- Confirmation modal before calling `DELETE /api/posts/<id>/`
- On success: redirect to map

---

## Day 5 — Comments & Sightings

### TICKET-024 · Comment + CommentPhoto models
- `Comment` model: `post`, `author`, `body`, `sighting_lat`, `sighting_lng`, `is_confirmed_sighting`, `created_at`
- `CommentPhoto` join table: `comment`, `photo`
- Run and verify migrations

### TICKET-025 · Comment list + create endpoints
- `GET /api/posts/<id>/comments/` — list all comments for a post, with photos and author info
- `POST /api/posts/<id>/comments/` — authenticated only; accept body, optional sighting coords, up to 2 image files

### TICKET-026 · Comment delete endpoint
- `DELETE /api/comments/<id>/` — author or admin only

### TICKET-027 · Comment thread UI
- Render comment list on post detail page below post body
- Each comment shows: author avatar + display name, timestamp, body, attached photos, optional sighting location label
- Author sees delete button on their own comments

### TICKET-028 · Comment form UI
- Text area for comment body
- Photo upload (up to 2 images) with preview
- Optional sighting map pin picker (same pattern as post form)
- Submit button wired to `POST /api/posts/<id>/comments/`

### TICKET-029 · Render sighting pins on post detail map
- Post detail page shows a small Leaflet map with the original post pin
- Any comments with sighting coords render as additional pins in a distinct style (e.g. orange)
- Confirmed sightings displayed differently from unconfirmed

---

## Day 6 — Status Updates & Owner Controls

### TICKET-030 · Status update endpoint
- `PATCH /api/posts/<id>/status/` — owner only
- Accepts `status` field: `active | sighting_reported | reunited | closed`

### TICKET-031 · Status update UI
- Owner sees status action buttons on post detail: "Mark as Reunited", "Close Post", "Reopen" (back to active)
- Current status badge always visible at top of post

### TICKET-032 · Confirm sighting
- Owner sees "Confirm Sighting" button on each comment
- `PATCH /api/comments/<id>/confirm/` — sets `is_confirmed_sighting = true`, updates post status to `sighting_reported`
- Confirmed comment is visually flagged in the thread (e.g. checkmark badge)

### TICKET-033 · Reunited celebration banner
- When post status is `reunited`, display a full-width banner on the post detail page
- Banner text: "🎉 [Pet name] has been reunited with their family!"

### TICKET-034 · Filter closed/reunited posts from map and list
- Map only shows pins for posts with status `active` or `sighting_reported`
- List view defaults to same; closed/reunited posts hidden unless explicitly filtered

---

## Day 7 — Admin, Polish & QA

### TICKET-035 · Admin delete controls
- Users with `role = admin` see a delete button on all posts and comments regardless of ownership
- No additional admin UI needed for MVP — rely on Django admin panel for user management

### TICKET-045 · Admin label management UI
- Route `/admin/labels` — list all labels with edit and delete controls
- Inline rename: click a label name to edit it in place, save on blur or Enter
- Delete button with confirmation; UI reflects that existing posts will lose the label
- "Add label" input at the bottom of the list; submits to `POST /api/labels/`
- Link to this page from the user dropdown for admin-role users only

### TICKET-036 · My Posts page
- Route `/my-posts` — lists all posts by the logged-in user including closed and reunited
- Same card layout as list view

### TICKET-037 · Error & empty states
- Empty map / list: friendly message with a "Post a lost or found pet" CTA
- 404 page for unknown post IDs
- Generic error boundary for failed API calls

### TICKET-038 · Responsive design pass
- Test and fix layout on mobile (375px) and tablet (768px)
- Nav collapses to hamburger or bottom bar on mobile
- Map and forms usable on touch devices

### TICKET-039 · QA pass
- Walk through all user stories (A-1 through S-3) and verify acceptance criteria
- Test as owner, non-owner, and unauthenticated user
- Check photo upload, map pin picking, and comment flows end to end

### TICKET-046 · Bug: photo editing silently ignored on post edit
- `partial_update` in `PostViewSet` never processes uploaded photo files — any photos submitted via the edit form are discarded
- Add photo management to the edit flow: show existing photo thumbnails, allow individual deletion, allow new uploads
- API: update `partial_update` to handle `photos` (new files) and `delete_photo_ids` (IDs to remove)
- Client: pre-populate the photo section in `PostForm` with existing photos when editing

### TICKET-047 · Bug: clearing all labels on post edit has no effect
- When all labels are deselected, `form.label_ids` is `[]` and nothing is appended to FormData
- API receives no `label_ids` key and treats it as "unchanged," so existing labels persist
- Fix: add a `replace_labels=true` marker to the edit FormData submission; check for it in `partial_update` to distinguish "no change" from "intentionally empty"

### TICKET-040 · Bug fixes & ship
- Fix any issues surfaced during QA
- Confirm Django server and Next.js app start cleanly from scratch
- Document local dev setup steps in a README

---

## Ticket Summary

| Day | Tickets | Count |
|-----|---------|-------|
| 1 | 001 – 007 | 7 |
| 2 | 008 – 012, 041 – 042 | 7 |
| 3 | 013 – 017, 043 | 6 |
| 4 | 018 – 023, 044 | 7 |
| 5 | 024 – 029 | 6 |
| 6 | 030 – 034 | 5 |
| 7 | 035 – 040, 045 | 7 |
| QA bugs | 046 – 047 | 2 |
| **Total** | | **47** |
