import Link from "next/link"

export default function PostNotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-4xl">🐾</p>
      <h1 className="text-lg font-semibold text-gray-800">Post not found</h1>
      <p className="text-sm text-gray-500 text-center">
        This post may have been removed or the link is incorrect.
      </p>
      <Link
        href="/map"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Back to Map
      </Link>
    </div>
  )
}
