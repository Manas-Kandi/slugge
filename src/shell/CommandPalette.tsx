import React, { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnapshot } from 'valtio'
import { state } from '../lib/store'

const commands = [
  { id: 'new-project', label: 'New Project', action: () => { state.newProjectOpen = true } },
  { id: 'go-dashboard', label: 'Go to Projects Home', action: (nav: any) => { nav('/app') } },
  { id: 'go-settings', label: 'Open Settings', action: (nav: any) => { nav('/app/settings') } },
]

export function CommandPalette() {
  const s = useSnapshot(state)
  const nav = useNavigate()
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (s.commandOpen) inputRef.current?.focus()
  }, [s.commandOpen])

  const items = useMemo(() => {
    const q = s.searchQuery.toLowerCase().trim()
    const base = commands.map(c => ({ ...c }))
    if (!q) return base
    return base.filter(c => c.label.toLowerCase().includes(q))
  }, [s.searchQuery])

  if (!s.commandOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/30" onClick={() => (state.commandOpen = false)}>
      <div className="card w-full max-w-xl" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-border p-2">
          <input
            ref={inputRef}
            className="input"
            placeholder="Type a command…"
            value={s.searchQuery}
            onChange={(e) => (state.searchQuery = e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') state.commandOpen = false
            }}
          />
        </div>
        <div className="max-h-80 overflow-auto">
          {items.length === 0 && <div className="p-3 text-sm text-text-secondary">No commands</div>}
          {items.map(it => (
            <button
              key={it.id}
              className="w-full text-left px-3 py-2 hover:bg-surface text-sm"
              onClick={() => {
                if (typeof it.action === 'function') it.action(nav)
                state.commandOpen = false
              }}
            >{it.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
