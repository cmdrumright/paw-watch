"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import type { PostSummary } from "@/lib/types"

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-sm text-gray-400 bg-white dark:bg-gray-950">
      Loading map…
    </div>
  ),
})

export default function MapPage() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    apiGet<PostSummary[]>("posts")
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return (
    <div className="h-full isolate relative">
      <LeafletMap posts={posts} />
      {loaded && posts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-6 py-5 max-w-xs text-center pointer-events-auto">
            <p className="text-2xl mb-2">🐾</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">No active posts nearby</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Be the first to post a lost or found pet in your area.</p>
            <Link
              href="/posts/new"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              + Post a Lost or Found Pet
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
