"use client"

import { useRef, useState } from "react"

const MAX_SLOTS = 4
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

interface Slot {
  file: File
  preview: string
}

interface Props {
  onChange: (files: File[]) => void
}

export default function PhotoUpload({ onChange }: Props) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return

    const newErrors: string[] = []
    const accepted: Slot[] = []

    Array.from(incoming).forEach((file) => {
      if (slots.length + accepted.length >= MAX_SLOTS) {
        newErrors.push(`Only ${MAX_SLOTS} photos allowed.`)
        return
      }
      if (file.size > MAX_BYTES) {
        newErrors.push(`"${file.name}" exceeds 5 MB.`)
        return
      }
      accepted.push({ file, preview: URL.createObjectURL(file) })
    })

    const next = [...slots, ...accepted]
    setSlots(next)
    setErrors(newErrors)
    onChange(next.map((s) => s.file))
  }

  function remove(index: number) {
    URL.revokeObjectURL(slots[index].preview)
    const next = slots.filter((_, i) => i !== index)
    setSlots(next)
    setErrors([])
    onChange(next.map((s) => s.file))
  }

  const emptySlots = MAX_SLOTS - slots.length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 flex-wrap">
        {slots.map((slot, i) => (
          <div key={slot.preview} className="relative w-20 h-20">
            <img
              src={slot.preview}
              alt={`Photo ${i + 1}`}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-2xl hover:border-blue-400 hover:text-blue-400 transition-colors"
            aria-label="Add photo"
          >
            +
          </button>
        ))}
      </div>

      {errors.map((err, i) => (
        <p key={i} className="text-xs text-red-600">{err}</p>
      ))}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        // reset value so the same file can be re-selected after removal
        onClick={(e) => { (e.target as HTMLInputElement).value = "" }}
      />
    </div>
  )
}
