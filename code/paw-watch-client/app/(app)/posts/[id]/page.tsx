"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { apiGet, apiDelete } from "@/lib/api"
import { getUserId } from "@/lib/auth"
import type { PostDetail } from "@/lib/types"

function ConfirmModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Delete this post?</h2>
        <p className="text-sm text-gray-600 mb-5">
          This can&apos;t be undone. All photos and comments will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PostDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    apiGet<PostDetail>(`posts/${id}`)
      .then(setPost)
      .catch(() => setNotFound(true))
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await apiDelete(`posts/${id}`)
      router.push("/map")
    } catch {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (notFound) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Post not found.
      </div>
    )
  }

  if (!post) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    )
  }

  const isOwner = getUserId() === post.owner.id
  const typeBadgeClass =
    post.type === "lost"
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700"
  const incidentDate = new Date(post.incident_date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const createdDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          deleting={deleting}
        />
      )}

      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Back link */}
          <Link
            href="/map"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5"
          >
            ← Back to Map
          </Link>

          {/* Type + status + date */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${typeBadgeClass}`}
              >
                {post.type}
              </span>
              <span className="text-xs text-gray-500 font-medium capitalize">{post.status}</span>
            </div>
            <span className="text-xs text-gray-400">Posted {createdDate}</span>
          </div>

          {/* Pet name */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{post.pet_name}</h1>

          {/* Species / breed / color */}
          <p className="text-sm text-gray-600 mb-3">
            {[post.species, post.breed, post.color].filter(Boolean).join(" · ")}
          </p>

          {/* Labels */}
          {post.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.labels.map((l) => (
                <span
                  key={l.id}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5"
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}

          {/* Photos */}
          {post.photos.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {post.photos
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((p) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt={post.pet_name}
                    className="h-36 w-36 object-cover rounded-lg shrink-0"
                  />
                ))}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{post.description}</p>

          {/* Location + date */}
          <div className="text-sm text-gray-500 mb-5 flex flex-col gap-1">
            <span>📍 {post.location_label}</span>
            <span>📅 {incidentDate}</span>
          </div>

          {/* Posted by + owner actions */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-6">
            <span className="text-sm text-gray-500">
              Posted by <span className="font-medium text-gray-700">{post.owner.display_name}</span>
            </span>
            {isOwner && (
              <div className="flex gap-2">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit Post
                </Link>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Comments placeholder — filled in future tickets */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Comments ({post.comment_count})
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
