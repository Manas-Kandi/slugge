import React, { useEffect, useRef, useState } from 'react'
import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { toast } from 'sonner'
import { nowISO } from '../../../lib/utils'
import { state } from '../../../lib/store'

export function BoardCanvas({ projectId }: { projectId: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [version, setVersion] = useState<number>(1)
  const [history, setHistory] = useState<string[]>([])

  // Autosave every 3s and on route change (component unmount)
  useEffect(() => {
    const save = (reason = 'auto') => {
      state.boardSaving = true
      // Simulate save latency
      setTimeout(() => {
        state.boardSaving = false
        state.boardLastSavedAt = nowISO()
        const label = `${new Date().toLocaleTimeString()} (${reason})`
        setHistory(h => [label, ...h].slice(0, 5))
        toast.success('Board saved')
      }, 300)
    }

    const interval = setInterval(() => save('interval'), 3000)

    const onSaveHotkey = (e: Event) => {
      save('manual')
    }

    window.addEventListener('save-board', onSaveHotkey)
    return () => {
      clearInterval(interval)
      window.removeEventListener('save-board', onSaveHotkey)
      // save on unmount
      state.boardSaving = true
      setTimeout(() => {
        state.boardSaving = false
        state.boardLastSavedAt = nowISO()
      }, 200)
    }
  }, [])

  return (
    <div className="card p-0 h-[640px] flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="text-sm text-text-secondary">
          Project: <span className="font-medium text-text">{projectId}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">Version</span>
          <select
            className="input h-8 py-1 w-[140px]"
            value={version}
            onChange={(e) => setVersion(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map(v => (
              <option key={v} value={v}>Checkpoint {v}</option>
            ))}
          </select>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0">
        <Tldraw inferDarkMode={false} />
      </div>
    </div>
  )
}
