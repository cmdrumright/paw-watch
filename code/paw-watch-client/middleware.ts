import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/login", "/register"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const isAuthenticated = req.cookies.has("auth_session")

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/map", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
}
