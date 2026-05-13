import Link from "next/link"
import type { PostSummary } from "@/lib/types"

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  sighting_reported: "Sighting Reported",
  reunited: "Reunited",
  closed: "Closed",
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function PostCard({ post }: { post: PostSummary }) {
  const isLost = post.type === "lost"

  return (
    <Link
      href={`/posts/${post.id}`}
      className="flex gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      {post.first_photo_url ? (
        <img
          src={post.first_photo_url}
          alt={post.pet_name}
          className="w-20 h-20 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-2xl">
          🐾
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${
                isLost ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" : "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
              }`}
            >
              {post.type}
            </span>
            {post.status !== "active" && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {STATUS_LABELS[post.status] ?? post.status}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap shrink-0">
            {formatDate(post.incident_date)}
          </span>
        </div>

        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {post.pet_name}
          {post.breed ? ` — ${post.breed}` : ""}
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {post.species}
          {post.color ? ` · ${post.color}` : ""}
          {post.location_label ? ` · ${post.location_label}` : ""}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {post.labels.map((label) => (
              <span
                key={label.id}
                className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
              >
                {label.name}
              </span>
            ))}
          </div>
          {post.comment_count > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap shrink-0">{post.comment_count} 💬</span>
          )}
        </div>
      </div>
    </Link>
  )
}
