"use client"

import { useEffect, useState } from "react"

export type Theme = "system" | "light" | "dark"

const STORAGE_KEY = "theme"

function getSystemResolved(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemResolved() : theme
  document.documentElement.classList.toggle("dark", resolved === "dark")
}

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system"
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system"
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

export function useTheme(): {
  theme: Theme
  setTheme: (t: Theme) => void
  resolved: "light" | "dark"
} {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolved, setResolved] = useState<"light" | "dark">("light")

  useEffect(() => {
    const saved = getTheme()
    setThemeState(saved)
    setResolved(saved === "system" ? getSystemResolved() : saved)

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    function onMediaChange() {
      const current = getTheme()
      if (current === "system") {
        const next = media.matches ? "dark" : "light"
        setResolved(next)
        document.documentElement.classList.toggle("dark", next === "dark")
      }
    }

    media.addEventListener("change", onMediaChange)
    return () => media.removeEventListener("change", onMediaChange)
  }, [])

  function handleSetTheme(t: Theme) {
    setTheme(t)
    setThemeState(t)
    setResolved(t === "system" ? getSystemResolved() : t)
  }

  return { theme, setTheme: handleSetTheme, resolved }
}
