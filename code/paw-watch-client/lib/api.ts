const API_URL = process.env.NEXT_PUBLIC_API_URL

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/login"
    throw new Error("401")
  }
  if (!res.ok) {
    throw new Error(String(res.status))
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/${path}`, {
    headers: { ...authHeaders() },
  })
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body: unknown, auth = true): Promise<T> {
  const res = await fetch(`${API_URL}/${path}`, {
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
  const res = await fetch(`${API_URL}/${path}`, {
    method: "POST",
    headers: { ...authHeaders() },
    body,
  })
  return handleResponse<T>(res)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}/${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  })
  return handleResponse<T>(res)
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_URL}/${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  return handleResponse<void>(res)
}
