"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { clearTokens, getDisplayName, logoutRequest } from "@/lib/auth"

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDisplayName(getDisplayName())
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
    } catch {
      // proceed with local logout even if server call fails
    }
    clearTokens()
    router.push("/login")
  }

  const isMapView = pathname === "/map"
  const isListView = pathname === "/list"
  const showViewToggle = isMapView || isListView
  const showNewPost = isMapView || isListView

  return (
    <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200 shrink-0">
      <Link href="/map" className="text-base font-bold text-gray-900 whitespace-nowrap">
        PawWatch Clarksville
      </Link>

      <div className="flex-1 flex justify-center">
        {showViewToggle && (
          isMapView ? (
            <Link
              href="/list"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              List View
            </Link>
          ) : (
            <Link
              href="/map"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Map View
            </Link>
          )
        )}
      </div>

      <div className="flex items-center gap-2">
        {showNewPost && (
          <Link
            href="/posts/new"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            + New Post
          </Link>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>👤</span>
            <span className="max-w-[120px] truncate">{displayName || "Account"}</span>
            <span className="text-xs text-gray-400">▾</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50">
              <div className="px-3 py-2 text-sm font-semibold text-gray-800 truncate border-b border-gray-100">
                {displayName}
              </div>
              <Link
                href="/my-posts"
                onClick={() => setDropdownOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My Posts
              </Link>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
