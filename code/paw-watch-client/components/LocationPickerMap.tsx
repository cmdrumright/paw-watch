"use client"

import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useState } from "react"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

const CLARKSVILLE: [number, number] = [36.5298, -87.3595]

const PIN = L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
          fill="#3b82f6" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white" opacity="0.7"/>
  </svg>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
})

interface ClickHandlerProps {
  onPick: (lat: number, lng: number) => void
}

function ClickHandler({ onPick }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    )
    const data = await res.json()
    const { road, neighbourhood, suburb, city, town, village } = data.address ?? {}
    const street = road ?? neighbourhood ?? suburb ?? ""
    const place = city ?? town ?? village ?? ""
    if (street && place) return `${street}, ${place}`
    if (street) return street
    if (place) return place
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}

export interface PickedLocation {
  lat: number
  lng: number
  label: string
}

interface Props {
  onPick: (location: PickedLocation) => void
  initialPin?: [number, number]
}

export default function LocationPickerMap({ onPick, initialPin }: Props) {
  const [pin, setPin] = useState<[number, number] | null>(initialPin ?? null)
  const center = initialPin ?? CLARKSVILLE

  async function handleClick(lat: number, lng: number) {
    setPin([lat, lng])
    const label = await reverseGeocode(lat, lng)
    onPick({ lat, lng, label })
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full cursor-crosshair"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={handleClick} />
      {pin && <Marker position={pin} icon={PIN} />}
    </MapContainer>
  )
}
