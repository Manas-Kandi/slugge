import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { state } from '../lib/store'
import { Search, Bell, Plus, Menu } from 'lucide-react'
import { CommandPalette } from './CommandPalette'
import { NewProjectModal } from './NewProjectModal'

export function AppShell() {
  const s = useSnapshot(state)
  const nav = useNavigate()
  const searchRef = useRef<HTMLInputElement | null>(null)

  // Persist sidebar state & global shortcuts
  useEffect(() => {
    const persisted = localStorage.getItem('slugge.sidebarOpen')
    if (persisted != null) state.sidebarOpen = persisted === '1'

    const onKeyDown = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey
      // Cmd/Ctrl+K → Command Palette
      if (cmd && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        state.commandOpen = !s.commandOpen
        return
      }
      // Global search focus
      if (!cmd && e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }
      // New project
      if (!cmd && (e.key === 'n' || e.key === 'N')) {
        if (document.activeElement && (document.activeElement as HTMLElement).tagName === 'INPUT') return
        e.preventDefault()
        state.newProjectOpen = true
        return
      }
      // Toggle Assistant
      if (!cmd && (e.key === 'a' || e.key === 'A')) {
        if (document.activeElement && (document.activeElement as HTMLElement).tagName === 'INPUT') return
        e.preventDefault()
        state.assistantOpen = !s.assistantOpen
        return
      }
      // Cmd/Ctrl+S → Save board
      if (cmd && e.key.toLowerCase() === 's') {
        e.preventDefault()
        window.dispatchEvent(new Event('save-board'))
        return
      }
      // Esc → close modals/drawers
      if (e.key === 'Escape') {
        if (s.commandOpen) state.commandOpen = false
        if (s.newProjectOpen) state.newProjectOpen = false
        if (s.notificationsOpen) state.notificationsOpen = false
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [s.commandOpen, s.assistantOpen, s.newProjectOpen, s.notificationsOpen])

  useEffect(() => {
    localStorage.setItem('slugge.sidebarOpen', s.sidebarOpen ? '1' : '0')
  }, [s.sidebarOpen])
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-[1480px] px-4 h-14 flex items-center gap-3">
          <button className="btn btn-ghost p-2" onClick={() => state.sidebarOpen = !s.sidebarOpen}><Menu size={18} /></button>
          <Link to="/app" className="font-semibold tracking-tight">slugge</Link>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg relative">
              <input
                ref={searchRef}
                className="input pr-10"
                placeholder="Search projects, atoms, themes…"
                value={s.searchQuery}
                onChange={(e) => (state.searchQuery = e.target.value)}
              />
              <Search className="absolute right-3 top-2.5" size={16} />
            </div>
          </div>
          <div className="relative">
            <button className="btn btn-ghost" onClick={() => (state.notificationsOpen = !s.notificationsOpen)}><Bell size={18}/></button>
            {s.notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 card p-2">
                <div className="text-sm font-medium mb-1">Notifications</div>
                <div className="text-sm text-text-secondary">No new notifications</div>
              </div>
            )}
          </div>
          <button className="btn btn-primary gap-2" onClick={() => (state.newProjectOpen = true)}><Plus size={16}/> New Project</button>
          <Link to="/app/settings" className="ml-2 text-sm">Account</Link>
        </div>
      </header>
      <div className="flex flex-1">
        {s.sidebarOpen && (
          <aside className="w-60 border-r border-border bg-surface p-3 hidden md:block">
            <nav className="space-y-1 text-sm">
              <Link className="block px-2 py-2 rounded-md hover:bg-white" to="/app">Projects</Link>
              <Link className="block px-2 py-2 rounded-md hover:bg-white" to="/app/settings">Settings</Link>
            </nav>
          </aside>
        )}
        <main className="flex-1">
          <div className="mx-auto max-w-[1480px] px-4 py-6">
            <Outlet />
          </div>
        </main>
        <aside className={`border-l border-border bg-surface hidden lg:block ${s.assistantOpen ? 'w-[360px]' : 'w-0'}`}>
          {/* Assistant panel placeholder */}
          <div className="p-3">
            <div className="text-sm font-medium mb-2">Assistant</div>
            <div className="text-sm text-text-secondary">Status, Q&A, Commands…</div>
            <div className="text-xs text-text-secondary mt-2">
              {state.boardSaving ? 'Saving…' : state.boardLastSavedAt ? `Saved at ${new Date(state.boardLastSavedAt).toLocaleTimeString()}` : 'No changes yet'}
            </div>
          </div>
        </aside>
      </div>
      <CommandPalette />
      <NewProjectModal />
    </div>
  )
}
