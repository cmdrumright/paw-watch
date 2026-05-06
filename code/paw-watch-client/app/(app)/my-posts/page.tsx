"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import PostCard from "@/components/PostCard"
import type { PostSummary } from "@/lib/types"

export default function MyPostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<PostSummary[]>("posts?mine=true")
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900">My Posts</h1>
          {!loading && (
            <span className="text-sm text-gray-500">{posts.length} posts</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400 text-sm">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <p className="text-gray-400 text-sm">You haven&apos;t posted anything yet.</p>
            <Link
              href="/posts/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              + New Post
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
