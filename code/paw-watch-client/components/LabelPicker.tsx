"use client"

import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import type { Label } from "@/lib/types"

interface Props {
  selected: number[]
  onChange: (ids: number[]) => void
}

export default function LabelPicker({ selected, onChange }: Props) {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Label[]>("labels")
      .then(setLabels)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggle(id: number) {
    onChange(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    )
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading labels…</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
      {labels.map((label) => {
        const checked = selected.includes(label.id)
        return (
          <label
            key={label.id}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(label.id)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{label.name}</span>
          </label>
        )
      })}
    </div>
  )
}
