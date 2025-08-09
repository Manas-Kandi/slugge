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

async function form<T>(path: string, data: FormData, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    // Do NOT set Content-Type for FormData – the browser will set the boundary
    credentials: 'include',
    method: 'POST',
    body: data,
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
    get: (id: string) => json<any>(`/v1/projects/${id}`),
    delete: (id: string) => json<void>(`/v1/projects/${id}`, { method: 'DELETE' })
  },
  documents: {
    list: (projectId: string) => json<any[]>(`/v1/projects/${projectId}/documents`),
    upload: (projectId: string, file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      return form<any>(`/v1/projects/${projectId}/documents`, fd)
    },
    delete: (projectId: string, docId: string) => json<void>(`/v1/projects/${projectId}/documents/${docId}`, { method: 'DELETE' })
  },
  processing: {
    start: (projectId: string) => json<{ progress: number; stage: string; events: string[] }>(`/v1/projects/${projectId}/processing/start`, { method: 'POST' }),
    status: (projectId: string) => json<{ progress: number; stage: string; events: string[] }>(`/v1/projects/${projectId}/processing/status`)
  },
  board: {
    createSnapshot: (projectId: string, snapshot: any) => json<any>(`/v1/projects/${projectId}/board/snapshots`, { method: 'POST', body: JSON.stringify({ snapshot }) }),
    listSnapshots: (projectId: string) => json<any[]>(`/v1/projects/${projectId}/board/snapshots`),
    getSnapshot: (projectId: string, snapshotId: string) => json<any>(`/v1/projects/${projectId}/board/snapshots/${snapshotId}`)
  },
  share: {
    mint: (projectId: string) => json<{ url: string }>(`/v1/projects/${projectId}/share/mint`, { method: 'POST' }),
    publicProject: (token: string) => json<any>(`/v1/share/${token}`)
  },
  billing: {
    checkout: (plan: string) => json<{ url?: string; sessionId?: string }>('/v1/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
    portal: () => json<{ url: string }>('/v1/billing/portal', { method: 'POST' })
  }
}
