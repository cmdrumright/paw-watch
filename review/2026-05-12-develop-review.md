# Code Review — develop branch
**Date:** 2026-05-12  
**Scope:** Security risks and code quality across API and client

---

## Summary

| Severity | Count |
|---|---|
| Critical | 0 (see note below) |
| High | 5 |
| Medium | 10 |
| Low | 9 |
| **Total** | **24** |

> **Note on .env files:** The agent flagged exposed secrets in `.env` and `.env.local`. Both files are confirmed **not tracked by git** (`git ls-files` returns nothing). The risk is not present in version control.

---

## High

### H1 — No rate limiting on auth endpoints
- **Files:** `api/views/auth.py`, `pawwatch/settings.py`
- **Detail:** Register, login, refresh, and logout endpoints have no throttling. Allows brute force and credential stuffing.
- **Fix:** Add `AnonRateThrottle` / `UserRateThrottle` to `REST_FRAMEWORK` settings and apply to auth views.

### H2 — Access and refresh tokens stored in localStorage
- **Files:** `lib/auth.ts`, `lib/api.ts`
- **Detail:** localStorage is readable by any JavaScript on the page. An XSS vulnerability anywhere in the app would expose both tokens.
- **Fix:** Move to `HttpOnly; Secure; SameSite=Strict` cookies set by the API. The current `auth_session` presence cookie is a good pattern — extend it to carry the access token.

### H3 — Token key strings duplicated across files
- **Files:** `lib/auth.ts` (constants `ACCESS_KEY`, `REFRESH_KEY`, etc.), `lib/api.ts` (hardcoded strings `"token"`, `"refreshToken"`, etc.)
- **Detail:** If a key name ever changes, both files must be updated in sync. Easy source of subtle bugs.
- **Fix:** Extract to `lib/storageKeys.ts` and import in both files.

### H4 — No coordinate range validation
- **Files:** `api/views/post.py` — `PostCreateSerializer`, `PostUpdateSerializer`
- **Detail:** `location_lat` and `location_lng` accept any float. Values outside `[-90, 90]` / `[-180, 180]` are stored without error.
- **Fix:** Add `validate_location_lat` / `validate_location_lng` methods to both serializers enforcing valid ranges.

### H5 — `forceLogout` duplicates `clearTokens` logic
- **Files:** `lib/api.ts` (lines 17–25), `lib/auth.ts` (`clearTokens`)
- **Detail:** Both functions clear the same localStorage keys and cookie. They will silently diverge if new keys are added to one but not the other.
- **Fix:** Export `clearTokens` from `auth.ts` and call it from `api.ts` instead of duplicating the logic. The circular-import risk is manageable: `api.ts` can import `clearTokens` since it doesn't depend on `apiPost`.

---

## Medium

### M1 — `SameSite=Lax` on auth session cookie; no `Secure` flag
- **File:** `lib/auth.ts` (lines 25–26, 35)
- **Detail:** `Lax` allows the cookie to be sent on cross-site top-level navigations. `Strict` is more appropriate. The cookie also lacks the `Secure` flag, so it can be sent over HTTP.
- **Fix:** `SameSite=Strict; Secure` in production.

### M2 — File deletion race condition
- **Files:** `api/views/post.py` (destroy, partial_update), `api/views/comment.py` (destroy)
- **Detail:** Storage file is deleted before the database record. An exception between the two leaves an orphaned DB row pointing to a deleted file.
- **Fix:** Delete the database record first (inside a transaction), then delete the file. Or use a `post_delete` signal.

### M3 — Empty / whitespace label names not rejected
- **File:** `api/views/label.py`
- **Detail:** A label with `name=""` or `"   "` can be created. Django's `CharField` will store it.
- **Fix:** Add `validate_name` in the label serializer: strip and reject if empty.

### M4 — `delete_photo_ids` silently ignores non-numeric values
- **File:** `api/views/post.py` (line ~304)
- **Detail:** `[int(x) for x in delete_ids_raw if x.isdigit()]` filters out invalid IDs instead of returning an error.
- **Fix:** Remove the filter and wrap in a `try/except ValueError`, returning a 400 on invalid input.

### M5 — No max-length on post description or comment body
- **Files:** `api/views/post.py` (`PostCreateSerializer`, `PostUpdateSerializer`), `api/views/comment.py` (`CommentCreateSerializer`)
- **Detail:** These fields are unbounded TextFields. Very large payloads are accepted without error.
- **Fix:** Add `max_length` to the serializer fields (e.g. 10 000 chars for description, 5 000 for comment body).

### M6 — `MAX_PHOTOS_PER_POST` and `MAX_PHOTOS_PER_COMMENT` are magic numbers
- **Files:** `api/views/post.py` (4 appears three times), `api/views/comment.py` (2 appears twice)
- **Fix:** Define module-level constants and reference them throughout.

### M7 — `MAX_PHOTO_SIZE_BYTES` duplicated between API and client
- **Files:** `api/views/post.py` (`MAX_PHOTO_BYTES`), `components/PhotoUpload.tsx` (`MAX_BYTES`)
- **Detail:** Both define 5 MB independently. If the limit changes, it must be updated in two places.
- **Fix:** On the client, the constant can stay in `PhotoUpload.tsx` since it controls the UI warning. The API is the authoritative enforcer. A comment noting they should match is sufficient.

### M8 — `API_URL` can be `undefined` at runtime
- **File:** `lib/api.ts` (line 7)
- **Detail:** `process.env.NEXT_PUBLIC_API_URL` is typed as `string | undefined`. If the env var is missing, every fetch will construct a broken URL and fail with an opaque error.
- **Fix:** Add a startup assertion: `if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set")`.

### M9 — Repeat `select_related` / `prefetch_related` pattern in comment views
- **File:** `api/views/comment.py`
- **Detail:** The same queryset pattern for fetching a comment with all relations appears in `create` and `confirm_sighting`. DRY violation.
- **Fix:** Extract to a module-level helper `_comment_with_relations(pk)`.

### M10 — Logout error silently swallowed with no user feedback
- **File:** `components/NavBar.tsx` (lines 32–37)
- **Detail:** `try { await logoutRequest() } catch {}` — if the logout API call fails, the user gets no indication. Tokens are cleared anyway, which is the right behaviour, but the silent catch should at minimum log the error.
- **Fix:** `catch (err) { console.warn("Logout request failed:", err) }` — or surface a brief toast if that pattern exists in the app.

---

## Low

### L1 — `SPECIES` list hardcoded in `PostForm.tsx`
- **File:** `components/PostForm.tsx` (line 21)
- **Fix:** Move to `lib/constants.ts` so it can be shared if needed elsewhere.

### L2 — Models missing `__str__` methods
- **Files:** `api/models/` — Post, Comment, Photo, PostLabel, CommentPhoto
- **Detail:** Makes the Django shell and any future admin panel harder to use.
- **Fix:** Add `__str__` to each model.

### L3 — No models registered in Django admin
- **File:** `api/admin.py`
- **Detail:** Fine for now, but makes database management harder without a custom tool.
- **Fix:** Register models when admin access becomes useful.

### L4 — SQLite in production
- **File:** `pawwatch/settings.py`
- **Detail:** SQLite has no concurrent write support and is unsuitable for a multi-user production workload. Acceptable for the current demo deployment, but worth flagging.
- **Fix:** Migrate to PostgreSQL before going live with real users.

### L5 — `PhotoSerializer.get_url` returns a relative URL if `request` is absent
- **File:** `api/views/post.py` (`PhotoSerializer`)
- **Detail:** Callers that don't pass `request` in context get a relative URL silently. Not a current bug but a fragile pattern.
- **Fix:** Add an assertion or raise if `request` is missing in contexts that require absolute URLs.

### L6 — `OwnerSerializer` exposes `avatar_url` which appears unused
- **File:** `api/views/post.py`
- **Detail:** `avatar_url` is in the serializer output but the client never renders an avatar image.
- **Fix:** Remove from serializer output when confirmed unused, or implement avatars.

### L7 — `dangerouslySetInnerHTML` in `app/layout.tsx`
- **File:** `app/layout.tsx`
- **Detail:** The FOUC-prevention inline script uses `dangerouslySetInnerHTML`. The string is a static literal with no user input, so there is no actual XSS risk here. Worth noting for awareness.
- **Fix:** No action needed. Add a comment confirming the string is static.

### L8 — No `prefetch={false}` on nav links that don't benefit from prefetching
- **File:** `components/NavBar.tsx`
- **Detail:** Next.js prefetches all `<Link>` targets by default. Admin and account links don't need prefetching.
- **Fix:** Add `prefetch={false}` to low-priority links (`/admin/labels`, `/my-posts`).

### L9 — `refresh token` blacklisting requires `rest_framework_simplejwt.token_blacklist` in `INSTALLED_APPS`
- **File:** `pawwatch/settings.py`
- **Detail:** `ROTATE_REFRESH_TOKENS = True` and `BLACKLIST_AFTER_ROTATION = True` are set, but this only works if `token_blacklist` is in `INSTALLED_APPS` and the blacklist migration has been applied. Verify this is wired up correctly.
- **Fix:** Confirm `token_blacklist` is in `INSTALLED_APPS` and `python manage.py migrate` has been run.

---

## Recommended ticket order

1. **H3** — Centralise storage key constants (small, reduces future risk)
2. **H5** — Remove `forceLogout` duplication (small, same PR as H3)
3. **H4** — Coordinate range validation (small API change)
4. **M3 + M5 + M6** — Input validation sweep (description max_length, label whitespace, magic number constants)
5. **M4** — Fix silent `delete_photo_ids` filtering
6. **M2** — Fix file deletion order / use signals
7. **M8** — Assert `API_URL` at startup
8. **H1** — Rate limiting on auth endpoints (higher effort, higher impact)
9. **H2** — Token storage in HttpOnly cookies (larger refactor)
10. **L9** — Verify refresh token blacklisting is active
