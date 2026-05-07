export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">PawWatch Clarksville</h1>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {children}
      </div>
    </div>
  )
}
