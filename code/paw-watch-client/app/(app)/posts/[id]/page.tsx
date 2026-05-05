"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { apiGet, apiDelete, apiPatch } from "@/lib/api"
import { getUserId } from "@/lib/auth"
import dynamic from "next/dynamic"
import CommentForm from "@/components/CommentForm"
import type { PostDetail, Comment } from "@/lib/types"

const PostDetailMap = dynamic(() => import("@/components/PostDetailMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-sm text-gray-400 bg-gray-50">
      Loading map…
    </div>
  ),
})

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

function CommentThread({
  postId,
  comments,
  onDelete,
}: {
  postId: number
  comments: Comment[]
  onDelete: (id: number) => void
}) {
  const currentUserId = getUserId()

  return (
    <div className="flex flex-col gap-4">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-xs font-semibold text-gray-500 uppercase">
            {c.author.display_name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-gray-800">{c.author.display_name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {currentUserId === c.author.id && (
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Delete comment"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{c.body}</p>

            {/* Photos */}
            {c.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {c.photos.map((p) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt="comment photo"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Sighting location */}
            {c.sighting_lat != null && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <span>📍</span>
                <span>
                  {c.is_confirmed_sighting ? "✓ Confirmed · " : ""}
                  {c.sighting_lat.toFixed(4)}, {c.sighting_lng?.toFixed(4)}
                </span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PostDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [notFound, setNotFound] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    apiGet<PostDetail>(`posts/${id}`)
      .then(setPost)
      .catch(() => setNotFound(true))
    apiGet<Comment[]>(`posts/${id}/comments`)
      .then(setComments)
      .catch(() => {})
  }, [id])

  async function handleDeletePost() {
    setDeleting(true)
    try {
      await apiDelete(`posts/${id}`)
      router.push("/map")
    } catch {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  async function handleStatusUpdate(newStatus: string) {
    if (!post) return
    setUpdatingStatus(true)
    try {
      const updated = await apiPatch<PostDetail>(`posts/${id}/status`, { status: newStatus })
      setPost(updated)
    } catch {
      // silently ignore
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleDeleteComment(commentId: number) {
    try {
      await apiDelete(`comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch {
      // silently ignore — comment already gone or permission denied
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
          onConfirm={handleDeletePost}
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
          <div className="text-sm text-gray-500 mb-4 flex flex-col gap-1">
            <span>📍 {post.location_label}</span>
            <span>📅 {incidentDate}</span>
          </div>

          {/* Map */}
          <div className="h-52 rounded-lg overflow-hidden border border-gray-200 isolate mb-5">
            <PostDetailMap
              postLat={post.location_lat}
              postLng={post.location_lng}
              postType={post.type}
              petName={post.pet_name}
              comments={comments}
            />
          </div>

          {/* Posted by + owner actions */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-3">
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

          {/* Status action buttons (owner only) */}
          {isOwner && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.status !== "reunited" && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate("reunited")}
                  disabled={updatingStatus}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Mark as Reunited
                </button>
              )}
              {post.status !== "closed" && post.status !== "reunited" && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate("closed")}
                  disabled={updatingStatus}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Close Post
                </button>
              )}
              {(post.status === "closed" || post.status === "reunited") && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate("active")}
                  disabled={updatingStatus}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Reopen
                </button>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Comments ({comments.length})
            </p>
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 mb-6">No comments yet.</p>
            ) : (
              <div className="mb-6">
                <CommentThread
                  postId={post.id}
                  comments={comments}
                  onDelete={handleDeleteComment}
                />
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Leave a Comment</p>
              <CommentForm
                postId={post.id}
                onCommentAdded={(c) => setComments((prev) => [...prev, c])}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
