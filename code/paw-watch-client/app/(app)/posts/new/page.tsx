"use client"

import { useRouter } from "next/navigation"
import PostForm, { type PostFormState } from "@/components/PostForm"
import { apiPostForm } from "@/lib/api"

export default function NewPostPage() {
  const router = useRouter()

  async function handleSubmit(form: PostFormState) {
    const body = new FormData()
    body.append("type", form.type)
    body.append("pet_name", form.pet_name.trim())
    body.append("species", form.species)
    body.append("breed", form.breed.trim())
    body.append("color", form.color.trim())
    body.append("description", form.description.trim())
    body.append("incident_date", form.incident_date)
    body.append("location_lat", String(form.location_lat))
    body.append("location_lng", String(form.location_lng))
    body.append("location_label", form.location_label)
    form.photos.forEach((f) => body.append("photos", f))
    form.label_ids.forEach((id) => body.append("label_ids", String(id)))

    try {
      const post = await apiPostForm<{ id: number }>("posts", body)
      router.push(`/posts/${post.id}`)
    } catch (err) {
      if (err instanceof Error && err.message === "400") {
        return { general: ["Please check your entries and try again."] }
      }
      return { general: ["Something went wrong. Please try again."] }
    }
  }

  return (
    <PostForm
      title="New Post"
      submitLabel="Post"
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  )
}
