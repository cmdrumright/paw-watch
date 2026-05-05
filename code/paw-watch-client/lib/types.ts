export interface Label {
  id: number
  name: string
}

export interface PostDetail {
  id: number
  type: "lost" | "found"
  status: string
  pet_name: string
  species: string
  breed: string
  color: string
  description: string
  incident_date: string
  location_lat: number
  location_lng: number
  location_label: string
  created_at: string
  updated_at: string
  owner: { id: number; display_name: string; avatar_url: string }
  photos: { id: number; url: string; order: number }[]
  labels: Label[]
  comment_count: number
}

export interface CommentPhoto {
  id: number
  url: string
  order: number
}

export interface Comment {
  id: number
  author: { id: number; display_name: string; avatar_url: string }
  body: string
  sighting_lat: number | null
  sighting_lng: number | null
  is_confirmed_sighting: boolean
  created_at: string
  photos: CommentPhoto[]
}

export interface PostSummary {
  id: number
  type: "lost" | "found"
  status: string
  pet_name: string
  species: string
  breed: string
  color: string
  location_label: string
  location_lat: number
  location_lng: number
  incident_date: string
  created_at: string
  owner_display_name: string
  first_photo_url: string | null
  labels: Label[]
  comment_count: number
}
