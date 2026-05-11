export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">PawWatch Clarksville</h1>
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {children}
      </div>
    </div>
  )
}
