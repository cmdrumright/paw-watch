"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import type { PostSummary } from "@/lib/types"

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  sighting_reported: "Sighting Reported",
  reunited: "Reunited",
  closed: "Closed",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function PostCard({ post }: { post: PostSummary }) {
  const isLost = post.type === "lost"

  return (
    <Link
      href={`/posts/${post.id}`}
      className="flex gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      {post.first_photo_url ? (
        <img
          src={post.first_photo_url}
          alt={post.pet_name}
          className="w-20 h-20 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-2xl">
          🐾
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${
                isLost ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {post.type}
            </span>
            {post.status !== "active" && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                {STATUS_LABELS[post.status] ?? post.status}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
            {formatDate(post.incident_date)}
          </span>
        </div>

        <p className="font-semibold text-gray-900 truncate">
          {post.pet_name}
          {post.breed ? ` — ${post.breed}` : ""}
        </p>

        <p className="text-sm text-gray-600 truncate">
          {post.species}
          {post.color ? ` · ${post.color}` : ""}
          {post.location_label ? ` · ${post.location_label}` : ""}
        </p>

        <div className="mt-2 flex items-center justify-end text-xs text-gray-500">
          {post.comment_count > 0 && (
            <span>{post.comment_count} 💬</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function ListPage() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<PostSummary[]>("posts")
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900">Active Posts</h1>
          {!loading && (
            <span className="text-sm text-gray-500">{posts.length} results</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400 text-sm">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="flex justify-center py-16 text-gray-400 text-sm">No active posts.</div>
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
