export class ApiError extends Error {
  constructor(public status: number) {
    super(String(status))
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function forceLogout() {
  localStorage.removeItem("token")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("displayName")
  localStorage.removeItem("userId")
  localStorage.removeItem("role")
  document.cookie = "auth_session=; path=/; SameSite=Lax; Max-Age=0"
  window.location.href = "/login"
}

// Shared promise so concurrent 401s don't trigger multiple refresh requests
let refreshPromise: Promise<boolean> | null = null

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  const refresh = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null
  if (!refresh) return false

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      })
      if (!res.ok) return false
      const { access } = await res.json()
      localStorage.setItem("token", access)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function fetchWithAuth(url: string, init: RequestInit): Promise<Response> {
  const res = await fetch(url, init)
  if (res.status !== 401) return res

  const refreshed = await attemptRefresh()
  if (!refreshed) {
    forceLogout()
    throw new ApiError(401)
  }

  return fetch(url, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${getToken()}` },
  })
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    forceLogout()
    throw new ApiError(401)
  }
  if (!res.ok) throw new ApiError(res.status)
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(`${API_URL}/${path}`, {
    headers: { ...authHeaders() },
  })
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body: unknown, auth = true): Promise<T> {
  const res = await fetchWithAuth(`${API_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiPostForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetchWithAuth(`${API_URL}/${path}`, {
    method: "POST",
    headers: { ...authHeaders() },
    body,
  })
  return handleResponse<T>(res)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithAuth(`${API_URL}/${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiPatchForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetchWithAuth(`${API_URL}/${path}`, {
    method: "PATCH",
    headers: { ...authHeaders() },
    body,
  })
  return handleResponse<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  return handleResponse<void>(res)
}
