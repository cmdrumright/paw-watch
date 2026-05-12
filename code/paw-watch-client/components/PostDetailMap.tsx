"use client"

import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import type { Comment } from "@/lib/types"
import { useTheme } from "@/lib/ThemeContext"
import { mapTileUrl, MAP_ATTRIBUTION } from "@/lib/theme"

function pinIcon(color: string, ring = "white") {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
            fill="${color}" stroke="${ring}" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.6"/>
    </svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -40],
  })
}

const POST_ICON_LOST = pinIcon("#ef4444")
const POST_ICON_FOUND = pinIcon("#22c55e")
const SIGHTING_ICON = pinIcon("#f97316")
const CONFIRMED_ICON = pinIcon("#f97316", "#15803d")

interface Props {
  postLat: number
  postLng: number
  postType: "lost" | "found"
  petName: string
  comments: Comment[]
}

export default function PostDetailMap({ postLat, postLng, postType, petName, comments }: Props) {
  const sightings = comments.filter((c) => c.sighting_lat != null)
  const { resolved } = useTheme()

  return (
    <div className="relative h-full w-full">
      <MapContainer
        key={resolved}
        center={[postLat, postLng]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution={MAP_ATTRIBUTION}
          url={mapTileUrl(resolved)}
          tileSize={512}
          zoomOffset={-1}
        />

        {/* Original post pin */}
        <Marker
          position={[postLat, postLng]}
          icon={postType === "lost" ? POST_ICON_LOST : POST_ICON_FOUND}
        >
          <Popup>
            <div className="text-sm font-medium text-gray-800">{petName}</div>
            <div className="text-xs text-gray-500 capitalize">{postType} — last seen here</div>
          </Popup>
        </Marker>

        {/* Sighting pins */}
        {sightings.map((c) => (
          <Marker
            key={c.id}
            position={[c.sighting_lat!, c.sighting_lng!]}
            icon={c.is_confirmed_sighting ? CONFIRMED_ICON : SIGHTING_ICON}
          >
            <Popup>
              <div className="text-sm font-medium text-gray-800">
                {c.is_confirmed_sighting ? "✓ Confirmed sighting" : "Reported sighting"}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{c.author.display_name}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{c.body}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {sightings.length > 0 && (
        <div className="absolute bottom-8 right-3 z-[1000] bg-white rounded-lg shadow border border-gray-200 px-3 py-2 text-xs space-y-1">
          <div className="font-semibold text-gray-700 uppercase tracking-wide mb-1">Legend</div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-700">Last seen</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-700">Sighting</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500 ring-2 ring-green-700" />
            <span className="text-gray-700">Confirmed</span>
          </div>
        </div>
      )}
    </div>
  )
}
