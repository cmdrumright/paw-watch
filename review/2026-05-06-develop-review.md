# Code Review — develop branch
**Date:** 2026-05-06
**Reviewed:** 2026-05-10
**Branch:** develop → main
**Scope:** Full codebase review (all commits since branch split from main)

---

## Outcomes

| # | Item | Decision |
|---|---|---|
| 1 | Hardcoded `SECRET_KEY` | ✅ Fixed |
| 2 | No photo upload validation | 🎫 [Issue #61](https://github.com/cmdrumright/paw-watch/issues/61) |
| 3 | Token refresh never attempted | 🎫 [Issue #62](https://github.com/cmdrumright/paw-watch/issues/62) |
| 4 | Tokens in localStorage / admin check | ⏭ Skipped (demo only) |
| 5 | Duplicate `get_labels` / `get_comment_count` | ⏭ Skipped |
| 6 | Duplicate `validate_label_ids` | ⏭ Skipped |
| 7 | Duplicate `OwnerSerializer` / `CommentAuthorSerializer` | ⏭ Skipped |
| 8 | Repeated prefetch chain | ⏭ Skipped |
| 9 | `views/post.py` too large | ⏭ Skipped (matches project conventions) |
| 10 | Inline components in `PostDetailPage` | 🎫 [Issue #63](https://github.com/cmdrumright/paw-watch/issues/63) |
| 11 | Edit form sends `"null"` coordinates | 🎫 [Issue #64](https://github.com/cmdrumright/paw-watch/issues/64) |
| 12 | Label list has no ordering | 🎫 [Issue #65](https://github.com/cmdrumright/paw-watch/issues/65) |
| 13 | Silent failure on post actions | 🎫 [Issue #66](https://github.com/cmdrumright/paw-watch/issues/66) |
| 14 | `setTimeout` focus hack in `LabelRow` | 🎫 [Issue #67](https://github.com/cmdrumright/paw-watch/issues/67) |
| 15 | Raw status code error strings | 🎫 [Issue #68](https://github.com/cmdrumright/paw-watch/issues/68) |
| 16 | Unnecessary `try/except` in `get_comment_count` | 🎫 [Issue #69](https://github.com/cmdrumright/paw-watch/issues/69) |

---

## Overview

The branch adds labels, admin controls, comment system, status progression, responsive design, My Posts, photo management, and JWT auth. The overall structure is clean for a project at this stage. Issues are listed in rough priority order.

---

## Security

### 1. Hardcoded `SECRET_KEY` — high priority
`code/paw-watch-api/pawwatch/settings.py:23` — the secret key is committed in plain text. Should be read from an environment variable. Same applies to `DEBUG` and `ALLOWED_HOSTS` — all three should be env-driven.

```python
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")
```

### 2. No file type or size validation on photo uploads
`views/post.py:218` and `views/comment.py:91` call `Photo.objects.create(file_path=file, ...)` with zero validation. A user can upload a `.exe`, a 500 MB file, or anything else. The API should validate MIME type and size before persisting.

### 3. Token refresh is never attempted
`lib/api.ts:14-21` — on a 401, the client immediately clears tokens and redirects to login. The refresh token (7-day TTL in localStorage) is never used to get a new access token. Users get logged out every 60 minutes despite having a valid session. The `refresh` endpoint exists but nothing calls it.

### 4. Tokens in `localStorage` / client-side admin check
JWTs in localStorage are XSS-vulnerable; HttpOnly cookies would be safer. `isAdmin()` in `lib/auth.ts:44` reads from localStorage — a user can forge `role=admin` in localStorage to access the admin UI routes (API calls will still be rejected server-side, but they can see the UI).

---

## Duplicate Code

### 5. `get_labels` and `get_comment_count` identical in two serializers
`views/post.py:49-58` (PostListSerializer) and `views/post.py:121-131` (PostDetailSerializer) have byte-for-byte duplicate methods. Extract into a mixin:

```python
class PostSerializerMixin:
    def get_labels(self, obj): ...
    def get_comment_count(self, obj): ...
```

### 6. `validate_label_ids` duplicated in Create and Update serializers
`views/post.py:153-158` and `views/post.py:182-187` are identical. Same mixin fix applies.

### 7. `OwnerSerializer` and `CommentAuthorSerializer` are the same shape
`views/post.py:77-82` and `views/comment.py:11-14` both expose `{id, display_name, avatar_url}`. One shared `UserPublicSerializer` would do.

### 8. Repeated prefetch chain
`Post.objects.select_related("owner").prefetch_related("post_photos__photo", "post_labels__label").get(pk=post.pk)` appears three times in `PostViewSet` (create, partial_update, set_status). Extract a helper:

```python
def _get_post_with_related(pk):
    return Post.objects.select_related("owner").prefetch_related(
        "post_photos__photo", "post_labels__label"
    ).get(pk=pk)
```

---

## Files That Should Be Split

### 9. `views/post.py` is doing too much (388 lines)
Six serializers plus the viewset live in one file. The serializers should move to `api/serializers/post.py`. Note that `views/comment.py` already imports `PhotoSerializer` from `views/post.py` — a view importing from another view is a code smell and a circular-risk.

### 10. `PostDetailPage` has two substantial inline components
`app/(app)/posts/[id]/page.tsx` defines `ConfirmModal` (36 lines) and `CommentThread` (80 lines) inside the same file as the page. `ConfirmModal` is reusable; `CommentThread` is complex enough to warrant `components/CommentThread.tsx`.

---

## Bugs

### 11. Edit form sends `"null"` for coordinates when no pin is set
`app/(app)/posts/[id]/edit/page.tsx:30-31`:
```ts
body.append("location_lat", String(form.location_lat))  // → "null"
body.append("location_lng", String(form.location_lng))  // → "null"
```
`String(null)` produces the string `"null"`, which DRF's `FloatField` rejects. The PostForm client-side validation blocks this in practice, but the serialization is still wrong. Should guard with a null check before appending.

### 12. `Label.objects.all()` has no ordering
`views/label.py:24` — the docstring says "ordered by name" but there is no `.order_by("name")`. Add ordering to the queryset or `Label.Meta.ordering`.

### 13. Silent failure on destructive and state-changing actions
`app/(app)/posts/[id]/page.tsx` — `handleConfirmSighting`, `handleDeleteComment`, and `handleStatusUpdate` all swallow errors silently. The user gets no feedback if the API call fails. These should set an error state.

---

## Other Issues

### 14. `setTimeout(..., 0)` for focus in `LabelRow`
`app/(app)/admin/labels/page.tsx:25` — this works but is fragile. An `autoFocus` prop on the `<input>` when `editing` is true is cleaner and declarative.

### 15. Error values are raw status code strings
`lib/api.ts` throws `new Error(String(res.status))` and callers check `err.message === "400"`. A typed error class would be cleaner and safer:
```ts
class ApiError extends Error { constructor(public status: number) { super(String(status)) } }
```

### 16. Unnecessary `try/except AttributeError` on `get_comment_count`
`views/post.py:56-59` — `obj.comments` is a defined reverse relation; it will never throw `AttributeError`. The guard is noise.

---

## Deviations from the Original Plan

- **No prod database config** — the original plan had SQLite (dev) / Postgres (prod). The README now only lists SQLite. No prod settings file exists. Fine for now, but needs addressing before deployment.
- **No S3 storage config** — plan listed S3-compatible object storage for prod. Currently all media writes to local disk. Same note — needs a plan before prod.
- **Auth** changed from DRF Token to SimpleJWT — this is fine and matches the code; the plan listed both as options.
- **Labels and admin controls** — added and not in the original MVP spec. Clean addition.
