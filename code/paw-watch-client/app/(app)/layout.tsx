import NavBar from "@/components/NavBar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  )
}
