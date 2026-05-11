# Sprint 1
**May 11 – May 18, 2026**
**Milestone:** https://github.com/cmdrumright/paw-watch/milestone/2

Code review fixes and dark mode feature.

---

## Schedule

### May 11 — Quick wins
Small, self-contained code review fixes. Clear the easy ones first.

| Issue | Title | Size |
|---|---|---|
| [#65](https://github.com/cmdrumright/paw-watch/issues/65) | Label list has no ordering | XS |
| [#69](https://github.com/cmdrumright/paw-watch/issues/69) | Remove unnecessary try/except in get_comment_count | XS |
| [#67](https://github.com/cmdrumright/paw-watch/issues/67) | Replace setTimeout focus hack with autoFocus in LabelRow | XS |
| [#64](https://github.com/cmdrumright/paw-watch/issues/64) | Edit form serializes null coordinates as string "null" | XS |

---

### May 12 — Dark mode foundation
All dark mode work depends on these. Must be done before any other dark mode tickets.

| Issue | Title | Size |
|---|---|---|
| [#71](https://github.com/cmdrumright/paw-watch/issues/71) | Dark mode: Tailwind config and Mapbox env var setup | XS |
| [#72](https://github.com/cmdrumright/paw-watch/issues/72) | Dark mode: theme hook and localStorage helpers | S |
| [#73](https://github.com/cmdrumright/paw-watch/issues/73) | Dark mode: prevent flash of wrong theme on load | S |

---

### May 13 — Dark mode toggle + component refactor
Build the toggle UI and wire it into the navbar. Extract inline components from PostDetailPage.

| Issue | Title | Size |
|---|---|---|
| [#74](https://github.com/cmdrumright/paw-watch/issues/74) | Dark mode: ThemeToggle component | S |
| [#75](https://github.com/cmdrumright/paw-watch/issues/75) | Dark mode: add ThemeToggle to navbar dropdown | XS |
| [#63](https://github.com/cmdrumright/paw-watch/issues/63) | Extract ConfirmModal and CommentThread out of PostDetailPage | S |

---

### May 14 — Error handling
Improve error feedback across the app and introduce the typed ApiError class.

| Issue | Title | Size |
|---|---|---|
| [#66](https://github.com/cmdrumright/paw-watch/issues/66) | Show error feedback on failed post actions | S |
| [#68](https://github.com/cmdrumright/paw-watch/issues/68) | Replace raw status code error strings with a typed ApiError class | M |

---

### May 15 — Security + map tiles
Photo upload validation and Mapbox tile swap.

| Issue | Title | Size |
|---|---|---|
| [#61](https://github.com/cmdrumright/paw-watch/issues/61) | Validate file type and size on photo uploads | M |
| [#76](https://github.com/cmdrumright/paw-watch/issues/76) | Dark mode: swap map tiles based on theme (Mapbox) | M |

---

### May 16–17 — Dark mode styling + token refresh
The two largest tickets. Styling pass touches every component; token refresh requires careful handling of in-flight requests.

| Issue | Title | Size | Days |
|---|---|---|---|
| [#77](https://github.com/cmdrumright/paw-watch/issues/77) | Dark mode: add dark: Tailwind variants to all components | L | May 16–17 |
| [#62](https://github.com/cmdrumright/paw-watch/issues/62) | Attempt token refresh before logging out on 401 | M | May 16–17 |

---

### May 18 — Buffer
QA pass, bug fixes, and PR review.

---

## Dependency Order

```
#71 (config)
  └── #72 (theme hook)
        ├── #73 (FOUC)
        ├── #74 (toggle component)
        │     └── #75 (navbar)
        └── #76 (map tiles)
              └── #77 (styling pass) ← needs toggle working to test
```

---

## Summary

| Day | Issues | Total |
|---|---|---|
| May 11 | #65, #69, #67, #64 | 4 |
| May 12 | #71, #72, #73 | 3 |
| May 13 | #74, #75, #63 | 3 |
| May 14 | #66, #68 | 2 |
| May 15 | #61, #76 | 2 |
| May 16–17 | #77, #62 | 2 |
| May 18 | Buffer | — |
| **Total** | | **16** |
