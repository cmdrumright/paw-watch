"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { clearTokens, getDisplayName, isAdmin, logoutRequest } from "@/lib/auth"
import ThemeToggle from "@/components/ThemeToggle"

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [admin, setAdmin] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDisplayName(getDisplayName())
    setAdmin(isAdmin())
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    try {
      await logoutRequest()
    } catch {}
    clearTokens()
    router.push("/login")
  }

  const isMapView = pathname === "/map"
  const isListView = pathname === "/list"
  const showViewToggle = isMapView || isListView
  const showNewPost = isMapView || isListView

  return (
    <>
      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-4 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <Link href="/map" className="text-base font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
          <span className="hidden sm:inline">PawWatch Clarksville</span>
          <span className="sm:hidden">🐾 PawWatch</span>
        </Link>

        {/* Desktop view toggle */}
        <div className="hidden sm:flex flex-1 justify-center">
          {showViewToggle && (
            isMapView ? (
              <Link
                href="/list"
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                List View
              </Link>
            ) : (
              <Link
                href="/map"
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Map View
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop new post button */}
          {showNewPost && (
            <Link
              href="/posts/new"
              className="hidden sm:inline-flex rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + New Post
            </Link>
          )}

          {/* Account dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span>👤</span>
              <span className="hidden sm:inline max-w-[120px] truncate">{displayName || "Account"}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">▾</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1 z-50">
                <div className="px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 truncate border-b border-gray-100 dark:border-gray-800">
                  {displayName}
                </div>
                <Link
                  href="/my-posts"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  My Posts
                </Link>
                {admin && (
                  <Link
                    href="/admin/labels"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Manage Labels
                  </Link>
                )}
                <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 mt-1">
                  <ThemeToggle />
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex h-14 shrink-0">
        <Link
          href="/map"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            isMapView ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <span className="text-lg">🗺️</span>
          Map
        </Link>
        <Link
          href="/list"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
            isListView ? "text-blue-600" : "text-gray-500"
          }`}
        >
          <span className="text-lg">☰</span>
          List
        </Link>
        <Link
          href="/posts/new"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-semibold text-blue-600"
        >
          <span className="text-lg">✚</span>
          New Post
        </Link>
      </nav>
    </>
  )
}
