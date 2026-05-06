"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import PostCard from "@/components/PostCard"
import type { PostSummary } from "@/lib/types"

export default function ListPage() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [includeClosed, setIncludeClosed] = useState(false)

  useEffect(() => {
    setLoading(true)
    const path = includeClosed ? "posts?include_closed=true" : "posts"
    apiGet<PostSummary[]>(path)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [includeClosed])

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900">
            {includeClosed ? "All Posts" : "Active Posts"}
          </h1>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="text-sm text-gray-500">{posts.length} results</span>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeClosed}
                onChange={(e) => setIncludeClosed(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600">Show closed</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400 text-sm">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <p className="text-2xl">🐾</p>
            <p className="text-sm text-gray-500">No posts found.</p>
            <Link
              href="/posts/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              + Post a Lost or Found Pet
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
