import { apiPost } from "./api"

const ACCESS_KEY = "token"
const REFRESH_KEY = "refreshToken"
const DISPLAY_NAME_KEY = "displayName"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getDisplayName(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(DISPLAY_NAME_KEY) ?? ""
}

export function setTokens(access: string, refresh: string, displayName: string) {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
  localStorage.setItem(DISPLAY_NAME_KEY, displayName)
  // presence cookie for middleware — not httpOnly so JS can set/clear it
  document.cookie = "auth_session=1; path=/; SameSite=Lax; Max-Age=604800"
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(DISPLAY_NAME_KEY)
  document.cookie = "auth_session=; path=/; SameSite=Lax; Max-Age=0"
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

export async function loginRequest(email: string, password: string) {
  return apiPost<{ access: string; refresh: string; display_name: string }>("auth/login/", { email, password }, false)
}

export async function registerRequest(email: string, password: string, display_name: string) {
  return apiPost<{ access: string; refresh: string; display_name: string }>("auth/register/", { email, password, display_name }, false)
}

export async function logoutRequest() {
  const refresh = localStorage.getItem(REFRESH_KEY) ?? ""
  await apiPost<void>("auth/logout/", { refresh })
}
