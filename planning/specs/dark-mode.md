# Feature Spec — Dark Mode
**Status:** Planning
**Date:** 2026-05-11

---

## Overview

Add a three-option theme toggle (System / Light / Dark) to the app. The selected theme applies to all UI components and swaps the Leaflet map tiles between Mapbox Streets (light) and Mapbox Dark.

---

## User Stories

- As a user, I can choose between Light, Dark, and System themes from the account dropdown in the navbar
- As a user, my theme preference is remembered across sessions
- As a user on System mode, my theme automatically follows my OS preference
- As a user, the map matches the active theme

---

## Behaviour

### Theme toggle
- Located in the account dropdown in `NavBar`, above the Log Out button
- Three options displayed as a segmented control: **System · Light · Dark**
- Active option is visually highlighted
- Selection is persisted to `localStorage` under the key `theme`

### Theme application
- Uses Tailwind's `class` dark mode strategy — adds or removes the `dark` class on `<html>`
- A blocking inline script in `app/layout.tsx` reads `localStorage` and sets the class before first paint to prevent flash of wrong theme
- In System mode, a `matchMedia('(prefers-color-scheme: dark)')` listener updates the class when the OS preference changes

### Map tiles
- All three map components swap tile layers based on the active theme:
  - Light → `mapbox/streets-v12`
  - Dark → `mapbox/dark-v11`
- Mapbox token read from `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable
- Tile URL format: `https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={token}`

---

## Technical Design

### New files
- `lib/theme.ts` — theme types, read/write helpers, and the `useTheme` hook
- `components/ThemeToggle.tsx` — the segmented three-option control

### Modified files
- `app/layout.tsx` — add blocking inline script for FOUC prevention; add `dark` class support to `<html>`
- `tailwind.config.ts` — set `darkMode: 'class'`
- `components/NavBar.tsx` — add `ThemeToggle` to the account dropdown
- `components/LeafletMap.tsx` — swap tile layer based on theme
- `components/LocationPickerMap.tsx` — swap tile layer based on theme
- `components/PostDetailMap.tsx` — swap tile layer based on theme
- All components with hardcoded light-mode Tailwind classes — add `dark:` variants

### Environment variables
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public access token |

Add to:
- `code/paw-watch-client/.env.local` (local dev)
- Railway frontend service env vars (production)

### `lib/theme.ts` interface
```ts
type Theme = "system" | "light" | "dark"

function getTheme(): Theme        // reads localStorage, defaults to "system"
function setTheme(t: Theme): void // writes localStorage, updates <html> class
function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; resolved: "light" | "dark" }
```

The `resolved` value collapses "system" to the actual active mode — used by map components to pick the correct tile URL.

---

## Mapbox Tile URLs

```ts
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

const TILE_URLS = {
  light: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
  dark:  `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
}
```

---

## Acceptance Criteria

- [ ] Selecting Light, Dark, or System updates the UI immediately
- [ ] Theme persists across page refresh and new sessions
- [ ] System mode tracks OS preference changes in real time without a page reload
- [ ] No flash of wrong theme on initial page load
- [ ] Map tiles match the active theme on all three map components
- [ ] Theme toggle is visible in the navbar dropdown for all authenticated users
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` missing or invalid shows a fallback (empty map, no crash)

---

## Out of Scope

- Per-page or per-component theme overrides
- Dark mode for the Django admin panel
- Animated theme transitions
