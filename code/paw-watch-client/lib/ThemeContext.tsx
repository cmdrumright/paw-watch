"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getTheme, setTheme as applyAndStore, getSystemResolved, type Theme } from "@/lib/theme"

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  resolved: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
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
    applyAndStore(t)
    setThemeState(t)
    setResolved(t === "system" ? getSystemResolved() : t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
