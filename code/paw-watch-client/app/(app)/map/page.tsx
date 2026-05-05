"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"
import type { PostSummary } from "@/components/LeafletMap"

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
      Loading map…
    </div>
  ),
})

export default function MapPage() {
  const [posts, setPosts] = useState<PostSummary[]>([])

  useEffect(() => {
    apiGet<PostSummary[]>("posts").then(setPosts).catch(() => {})
  }, [])

  return (
    <div className="h-full isolate">
      <LeafletMap posts={posts} />
    </div>
  )
}
