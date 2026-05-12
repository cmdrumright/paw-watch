"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import PhotoUpload from "@/components/PhotoUpload"
import type { PickedLocation } from "@/components/LocationPickerMap"
import { apiPostForm } from "@/lib/api"
import type { Comment } from "@/lib/types"

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-sm text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
        Loading map…
      </div>
    ),
  }
)

interface Props {
  postId: number
  onCommentAdded: (comment: Comment) => void
}

export default function CommentForm({ postId, onCommentAdded }: Props) {
  const [body, setBody] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [sighting, setSighting] = useState<PickedLocation | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!body.trim()) { setError("Comment can't be empty."); return }
    setError("")
    setSubmitting(true)

    const formData = new FormData()
    formData.append("body", body.trim())
    if (sighting) {
      formData.append("sighting_lat", String(sighting.lat))
      formData.append("sighting_lng", String(sighting.lng))
    }
    photos.forEach((f) => formData.append("photos", f))

    try {
      const comment = await apiPostForm<Comment>(`posts/${postId}/comments`, formData)
      onCommentAdded(comment)
      setBody("")
      setPhotos([])
      setSighting(null)
      setShowMap(false)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Leave a comment…"
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />

      {/* Photos */}
      <PhotoUpload maxSlots={2} onChange={setPhotos} />

      {/* Sighting pin toggle */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          className="self-start text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showMap ? "Remove sighting pin" : "Add sighting location"}
        </button>

        {showMap && (
          <div className="flex flex-col gap-1.5">
            <div className="h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 isolate">
              <LocationPickerMap
                initialPin={sighting ? [sighting.lat, sighting.lng] : undefined}
                onPick={(loc) => setSighting(loc)}
              />
            </div>
            {sighting && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>📍</span>
                <span>{sighting.label}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Posting…" : "Post Comment"}
      </button>
    </div>
  )
}
