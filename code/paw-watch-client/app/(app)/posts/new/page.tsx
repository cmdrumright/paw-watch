"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import PhotoUpload from "@/components/PhotoUpload"
import type { PickedLocation } from "@/components/LocationPickerMap"

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-lg">
        Loading map…
      </div>
    ),
  }
)

const SPECIES = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Guinea Pig", "Reptile", "Other"]

export interface PostFormState {
  type: "lost" | "found"
  pet_name: string
  species: string
  breed: string
  color: string
  description: string
  incident_date: string
  photos: File[]
  location_lat: number | null
  location_lng: number | null
  location_label: string
}

const INITIAL: PostFormState = {
  type: "lost",
  pet_name: "",
  species: "Dog",
  breed: "",
  color: "",
  description: "",
  incident_date: "",
  photos: [],
  location_lat: null,
  location_lng: null,
  location_label: "",
}

function InputField({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"

export default function NewPostPage() {
  const router = useRouter()
  const [form, setForm] = useState<PostFormState>(INITIAL)

  function set<K extends keyof PostFormState>(key: K, value: PostFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">New Post</h1>

        <div className="flex flex-col gap-6">
          {/* Post type toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Post Type</span>
            <div className="flex gap-3">
              {(["lost", "found"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={`flex-1 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    form.type === t
                      ? t === "lost"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      form.type === t
                        ? t === "lost"
                          ? "border-red-500"
                          : "border-green-500"
                        : "border-gray-400"
                    }`}
                  >
                    {form.type === t && (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          t === "lost" ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                    )}
                  </span>
                  {t === "lost" ? "Lost" : "Found"}
                </button>
              ))}
            </div>
          </div>

          {/* Pet name + species */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Pet Name" id="pet_name">
              <input
                id="pet_name"
                type="text"
                value={form.pet_name}
                onChange={(e) => set("pet_name", e.target.value)}
                className={inputClass}
                placeholder="e.g. Max"
              />
            </InputField>

            <InputField label="Species" id="species">
              <select
                id="species"
                value={form.species}
                onChange={(e) => set("species", e.target.value)}
                className={inputClass}
              >
                {SPECIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </InputField>
          </div>

          {/* Breed + color */}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Breed" id="breed">
              <input
                id="breed"
                type="text"
                value={form.breed}
                onChange={(e) => set("breed", e.target.value)}
                className={inputClass}
                placeholder="e.g. Labrador"
              />
            </InputField>

            <InputField label="Color" id="color">
              <input
                id="color"
                type="text"
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className={inputClass}
                placeholder="e.g. Golden"
              />
            </InputField>
          </div>

          {/* Date */}
          <InputField label="Date Lost / Found" id="incident_date">
            <input
              id="incident_date"
              type="date"
              value={form.incident_date}
              onChange={(e) => set("incident_date", e.target.value)}
              className={inputClass}
            />
          </InputField>

          {/* Description */}
          <InputField label="Description" id="description">
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass}
              placeholder="Describe the pet — markings, behaviour, where last seen…"
            />
          </InputField>

          {/* Photos */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
              Photos <span className="text-gray-400 font-normal">(up to 4, 5 MB each)</span>
            </span>
            <PhotoUpload onChange={(files) => set("photos", files)} />
          </div>

          {/* Location picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">
              Location <span className="text-gray-400 font-normal">— click the map to drop a pin</span>
            </span>
            <div className="h-56 rounded-lg overflow-hidden border border-gray-300 isolate">
              <LocationPickerMap
                onPick={(loc: PickedLocation) => {
                  setForm((f) => ({
                    ...f,
                    location_lat: loc.lat,
                    location_lng: loc.lng,
                    location_label: loc.label,
                  }))
                }}
              />
            </div>
            {form.location_label && (
              <p className="text-sm text-gray-700 flex items-center gap-1">
                <span>📍</span>
                <span>{form.location_label}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Post
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
