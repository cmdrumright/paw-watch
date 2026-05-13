import { getUserId } from "@/lib/auth"
import type { Comment } from "@/lib/types"

interface Props {
  comments: Comment[]
  isPostOwner: boolean
  isAdmin: boolean
  onDelete: (id: number) => void
  onConfirm: (id: number) => void
}

export default function CommentThread({ comments, isPostOwner, isAdmin, onDelete, onConfirm }: Props) {
  const currentUserId = getUserId()

  return (
    <div className="flex flex-col gap-4">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            {c.author.display_name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.author.display_name}</span>
                {c.is_confirmed_sighting && (
                  <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-1.5 py-0.5 font-medium">
                    ✓ Confirmed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {(currentUserId === c.author.id || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Delete comment"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap">{c.body}</p>

            {c.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {c.photos.map((p) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt="comment photo"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {c.sighting_lat != null && (
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span>📍</span>
                  <span>{c.sighting_lat.toFixed(4)}, {c.sighting_lng?.toFixed(4)}</span>
                </p>
                {isPostOwner && !c.is_confirmed_sighting && (
                  <button
                    type="button"
                    onClick={() => onConfirm(c.id)}
                    className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors"
                  >
                    ✓ Confirm Sighting
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
