import { proxy } from 'valtio'

export type User = { id: string; email: string; name?: string | null } | null

export const state = proxy({
  user: null as User,
  loading: true,
  sidebarOpen: true,
  assistantOpen: false,
  // Global UI state
  commandOpen: false,
  newProjectOpen: false,
  notificationsOpen: false,
  searchQuery: '',
  viewMode: 'grid' as 'grid' | 'list',
  // Simple role gating (stub): 'owner' | 'researcher' | 'viewer'
  role: 'owner' as 'owner' | 'researcher' | 'viewer',
  // Board save indicator
  boardSaving: false,
  boardLastSavedAt: null as string | null
})
