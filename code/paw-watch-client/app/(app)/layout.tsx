import NavBar from "@/components/NavBar"
import ErrorBoundary from "@/components/ErrorBoundary"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 min-h-0">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  )
}
