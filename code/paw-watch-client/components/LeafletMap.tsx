"use client"

import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import Link from "next/link"
import type { PostSummary } from "@/lib/types"
import { useTheme } from "@/lib/ThemeContext"
import { mapTileUrl, MAP_ATTRIBUTION } from "@/lib/theme"

export type { PostSummary }

const CLARKSVILLE: [number, number] = [36.5298, -87.3595]

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.6"/>
    </svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -40],
  })
}

const LOST_ICON = pinIcon("#ef4444")
const FOUND_ICON = pinIcon("#22c55e")

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  sighting_reported: "Sighting Reported",
  reunited: "Reunited",
  closed: "Closed",
}

interface Props {
  posts: PostSummary[]
}

export default function LeafletMap({ posts }: Props) {
  const { resolved } = useTheme()

  return (
    <div className="relative h-full w-full">
      <MapContainer
        key={resolved}
        center={CLARKSVILLE}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution={MAP_ATTRIBUTION}
          url={mapTileUrl(resolved)}
          tileSize={512}
          zoomOffset={-1}
        />
        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.location_lat, post.location_lng]}
            icon={post.type === "lost" ? LOST_ICON : FOUND_ICON}
          >
            <Popup className="paw-popup">
              <div className="w-48 text-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${
                      post.type === "lost"
                        ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                        : "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                    }`}
                  >
                    {post.type}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{STATUS_LABELS[post.status] ?? post.status}</span>
                </div>

                {post.first_photo_url && (
                  <img
                    src={post.first_photo_url}
                    alt={post.pet_name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}

                <p className="font-semibold text-gray-900 dark:text-gray-100">{post.pet_name}</p>
                <p className="text-gray-700 dark:text-gray-300 text-xs">
                  {post.species}{post.breed ? ` · ${post.breed}` : ""}
                </p>

                {post.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 mb-3">
                    {post.labels.map((label) => (
                      <span
                        key={label.id}
                        className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}

                {!post.labels.length && <div className="mb-3" />}

                <Link
                  href={`/posts/${post.id}`}
                  className="block text-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                  style={{ color: "white" }}
                >
                  View Post
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-8 right-3 z-[1000] bg-white rounded-lg shadow border border-gray-200 px-3 py-2 text-sm space-y-1">
        <div className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Legend</div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-700">Lost</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-700">Found</span>
        </div>
      </div>
    </div>
  )
}
