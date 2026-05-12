"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import PostForm, { type PostFormState } from "@/components/PostForm"
import { apiGet, apiPatchForm, ApiError } from "@/lib/api"
import type { PostDetail } from "@/lib/types"

export default function EditPostPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    apiGet<PostDetail>(`posts/${id}`)
      .then(setPost)
      .catch(() => setNotFound(true))
  }, [id])

  async function handleSubmit(form: PostFormState) {
    const body = new FormData()
    body.append("type", form.type)
    body.append("pet_name", form.pet_name.trim())
    body.append("species", form.species)
    body.append("breed", form.breed.trim())
    body.append("color", form.color.trim())
    body.append("description", form.description.trim())
    body.append("incident_date", form.incident_date)
    if (form.location_lat !== null && form.location_lng !== null) {
      body.append("location_lat", String(form.location_lat))
      body.append("location_lng", String(form.location_lng))
    }
    body.append("location_label", form.location_label)
    form.photos.forEach((f) => body.append("photos", f))
    form.delete_photo_ids.forEach((id) => body.append("delete_photo_ids", String(id)))
    body.append("replace_labels", "true")
    form.label_ids.forEach((lid) => body.append("label_ids", String(lid)))

    try {
      await apiPatchForm(`posts/${id}`, body)
      router.push(`/posts/${id}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        router.push(`/posts/${id}`)
        return
      }
      if (err instanceof ApiError && err.status === 400) {
        return { general: ["Please check your entries and try again."] }
      }
      return { general: ["Something went wrong. Please try again."] }
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

  const initialValues: Partial<PostFormState> = {
    type: post.type,
    pet_name: post.pet_name,
    species: post.species,
    breed: post.breed,
    color: post.color,
    description: post.description,
    incident_date: post.incident_date,
    label_ids: post.labels.map((l) => l.id),
    location_lat: post.location_lat,
    location_lng: post.location_lng,
    location_label: post.location_label,
  }

  return (
    <PostForm
      title="Edit Post"
      submitLabel="Save"
      initialValues={initialValues}
      initialPhotos={post.photos.slice().sort((a, b) => a.order - b.order).map((p) => ({ id: p.id, url: p.url }))}
      initialPin={[post.location_lat, post.location_lng]}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/posts/${id}`)}
    />
  )
}
