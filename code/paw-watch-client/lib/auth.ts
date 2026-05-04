import { apiPost } from "./api"

const ACCESS_KEY = "token"
const REFRESH_KEY = "refreshToken"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_KEY)
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
  // presence cookie for middleware — not httpOnly so JS can set/clear it
  document.cookie = "auth_session=1; path=/; SameSite=Lax; Max-Age=604800"
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  document.cookie = "auth_session=; path=/; SameSite=Lax; Max-Age=0"
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

export async function loginRequest(email: string, password: string) {
  return apiPost<{ access: string; refresh: string }>("auth/login/", { email, password }, false)
}

export async function registerRequest(email: string, password: string, display_name: string) {
  return apiPost<{ access: string; refresh: string }>("auth/register/", { email, password, display_name }, false)
}
