"use client"

import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer } from "react-leaflet"

const CLARKSVILLE: [number, number] = [36.5298, -87.3595]

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
  comment_count: number
}

interface Props {
  posts: PostSummary[]
}

export default function LeafletMap({ posts: _posts }: Props) {
  return (
    <MapContainer
      center={CLARKSVILLE}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}
