"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api"
import { isAdmin } from "@/lib/auth"
import type { Label } from "@/lib/types"

function LabelRow({
  label,
  onRename,
  onDelete,
}: {
  label: Label
  onRename: (id: number, name: string) => void
  onDelete: (id: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label.name)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function startEdit() {
    setEditing(true)
  }

  function commit() {
    const trimmed = value.trim()
    if (trimmed && trimmed !== label.name) {
      onRename(label.id, trimmed)
    } else {
      setValue(label.name)
    }
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commit()
    if (e.key === "Escape") { setValue(label.name); setEditing(false) }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="w-full rounded border border-blue-400 px-2 py-0.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="text-sm text-gray-800 dark:text-gray-200 hover:text-blue-600 transition-colors text-left"
            title="Click to rename"
          >
            {label.name}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {confirmDelete ? (
          <>
            <span className="text-xs text-gray-500 dark:text-gray-400">Remove from all posts?</span>
            <button
              type="button"
              onClick={() => onDelete(label.id)}
              className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
            aria-label={`Delete ${label.name}`}
          >
            🗑
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminLabelsPage() {
  const router = useRouter()
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")

  useEffect(() => {
    if (!isAdmin()) { router.replace("/map"); return }
    apiGet<Label[]>("labels")
      .then(setLabels)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  async function handleRename(id: number, name: string) {
    try {
      const updated = await apiPatch<Label>(`labels/${id}`, { name })
      setLabels((prev) => prev.map((l) => (l.id === id ? updated : l)))
    } catch {
      // silently revert — LabelRow already reset value on error path
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiDelete(`labels/${id}`)
      setLabels((prev) => prev.filter((l) => l.id !== id))
    } catch {
      // silently ignore
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setAddError("")
    setAdding(true)
    try {
      const created = await apiPost<Label>("labels", { name })
      setLabels((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName("")
    } catch {
      setAddError("Could not add label. Name may already exist.")
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Manage Labels</h1>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 mb-6">
          {labels.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4">No labels yet.</p>
          ) : (
            labels.map((label) => (
              <LabelRow
                key={label.id}
                label={label}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New label name"
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
          {addError && <p className="text-xs text-red-600">{addError}</p>}
        </form>
      </div>
    </div>
  )
}
