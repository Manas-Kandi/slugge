import React, { useEffect, useRef, useState } from 'react'
import { Tldraw } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { toast } from 'sonner'
import { nowISO } from '../../../lib/utils'
import { state } from '../../../lib/store'
import { api } from '../../../lib/api'

export function BoardCanvas({ projectId }: { projectId: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [version, setVersion] = useState<number>(1)
  const [history, setHistory] = useState<string[]>([])
  const [snapshots, setSnapshots] = useState<{ id: string; version: number; created_at: string }[]>([])

  // Load snapshots & autosave every 3s; persist via API
  useEffect(() => {
    let mounted = true
    const refresh = async () => {
      try {
        const rows = await api.board.listSnapshots(projectId)
        if (!mounted) return
        setSnapshots(rows)
        if (rows.length > 0) setVersion(rows[0].version)
      } catch (e) { /* ignore */ }
    }

    const save = async (reason = 'auto') => {
      try {
        state.boardSaving = true
        const res = await api.board.createSnapshot(projectId, { reason, ts: Date.now() })
        state.boardLastSavedAt = nowISO()
        const label = `${new Date().toLocaleTimeString()} (${reason})`
        setHistory(h => [label, ...h].slice(0, 5))
        await refresh()
        setVersion(res.version)
        toast.success('Board saved')
      } catch (e) {
        // silent fail
      } finally {
        state.boardSaving = false
      }
    }

    refresh()
    const interval = setInterval(() => save('interval'), 3000)

    const onSaveHotkey = (_e: Event) => { void save('manual') }
    window.addEventListener('save-board', onSaveHotkey)
    return () => {
      clearInterval(interval)
      window.removeEventListener('save-board', onSaveHotkey)
    }
  }, [projectId])

  return (
    <div className="card p-0 h-[640px] flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="text-sm text-text-secondary">
          Project: <span className="font-medium text-text">{projectId}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">Version</span>
          <select
            className="input h-8 py-1 w-[180px]"
            value={version}
            onChange={(e) => setVersion(parseInt(e.target.value))}
          >
            {snapshots.length === 0 ? (
              <option value={1}>Checkpoint 1</option>
            ) : (
              snapshots.map(s => (
                <option key={s.id} value={s.version}>Checkpoint {s.version}</option>
              ))
            )}
          </select>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0">
        <Tldraw inferDarkMode={false} />
      </div>
    </div>
  )
}
