import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/lib/ThemeContext"

export const metadata: Metadata = {
  title: "PawWatch Clarksville",
  description: "Lost & found pets community site for Clarksville, TN",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme') || 'system';
              var dark = theme === 'dark' ||
                (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (dark) document.documentElement.classList.add('dark');
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  )
}
