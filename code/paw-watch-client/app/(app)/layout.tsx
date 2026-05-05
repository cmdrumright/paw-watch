import NavBar from "@/components/NavBar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
