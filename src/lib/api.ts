export const API_BASE = import.meta.env.VITE_API_BASE_URL as string

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
    ...init
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${detail}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  me: () => json<{ id: string; email: string; name: string | null }>('/v1/me'),
  login: (email: string, password: string) => json('/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (payload: any) => json('/v1/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  projects: {
    list: () => json<any[]>('/v1/projects'),
    create: (payload: any) => json('/v1/projects', { method: 'POST', body: JSON.stringify(payload) }),
    get: (id: string) => json<any>(`/v1/projects/${id}`)
  },
  billing: {
    checkout: (plan: string) => json<{ url?: string; sessionId?: string }>('/v1/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
    portal: () => json<{ url: string }>('/v1/billing/portal', { method: 'POST' })
  }
}
