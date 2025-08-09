import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useSnapshot } from 'valtio'
import { state } from '../../lib/store'
import { toast } from 'sonner'
import { api } from '../../lib/api'

type ProjectItem = { id: string; name: string; updated?: string; status?: string; docs?: number; cost?: string }

export function Dashboard() {
  const s = useSnapshot(state)
  const [sort, setSort] = useState<'recent' | 'name'>('recent')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [items, setItems] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.projects.list()
      .then((res) => { if (mounted) setItems(res as ProjectItem[]) })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    const q = s.searchQuery.toLowerCase().trim()
    let arr = items.filter(p => p.name.toLowerCase().includes(q))
    if (sort === 'name') arr = [...arr].sort((a, b) => a.name.localeCompare(b.name))
    return arr
  }, [s.searchQuery, sort, items])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Projects</h2>
        <div className="flex items-center gap-2">
          <select className="input h-9 py-1 w-[140px]" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="recent">Sort: Recent</option>
            <option value="name">Sort: Name</option>
          </select>
          <button className="btn btn-ghost" onClick={() => (state.viewMode = s.viewMode === 'grid' ? 'list' : 'grid')}>{s.viewMode === 'grid' ? 'List view' : 'Grid view'}</button>
          <button className="btn btn-primary" onClick={() => (state.newProjectOpen = true)}>New Project</button>
        </div>
      </div>
      {loading ? (
        <div className="card p-6 text-center text-text-secondary">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-6 text-center">
          <div className="text-text-secondary">Create a project to begin.</div>
          <button className="btn btn-primary mt-3" onClick={() => (state.newProjectOpen = true)}>New Project</button>
        </div>
      ) : s.viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => (
            <div key={p.id} className="card p-4 hover:shadow-soft2 transition group">
              <Link to={`/app/projects/${p.id}/overview`} className="font-medium block">{p.name}</Link>
              <div className="text-sm text-text-secondary mt-1">{p.docs ?? 0} docs · {p.cost ?? '$0.00'}</div>
              <div className="mt-2 text-xs">{p.status ?? 'Active'} • updated {p.updated ?? 'just now'} ago</div>
              <div className="opacity-0 group-hover:opacity-100 transition mt-3 flex gap-2 text-sm">
                <Link to={`/app/projects/${p.id}/overview`} className="btn btn-ghost">Open</Link>
                <button className="btn btn-ghost" onClick={() => toast.success('Duplicated')}>Duplicate</button>
                <button className="btn btn-ghost" onClick={() => toast('Archived')}>Archive</button>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-secondary">
                <th className="text-left p-2">Name</th>
                <th>Status</th>
                <th>Docs</th>
                <th>Cost</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2"><Link to={`/app/projects/${p.id}/overview`} className="font-medium">{p.name}</Link></td>
                  <td>{p.status ?? 'Active'}</td>
                  <td>{p.docs ?? 0}</td>
                  <td>{p.cost ?? '$0.00'}</td>
                  <td className="p-2 text-right"><button className="btn btn-ghost" onClick={() => setConfirmDelete(p.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 z-50 grid place-items-center" onClick={() => setConfirmDelete(null)}>
          <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border">
              <div className="text-lg font-medium">Delete project</div>
              <div className="text-sm text-text-secondary">Type DELETE to confirm.</div>
            </div>
            <div className="p-4 grid gap-2">
              <input className="input" placeholder="DELETE" onChange={(e) => {
                const ok = e.target.value.trim().toUpperCase() === 'DELETE'
                ;(document.getElementById('confirm-btn') as HTMLButtonElement | null)?.toggleAttribute('disabled', !ok)
              }} />
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button id="confirm-btn" className="btn btn-primary" disabled onClick={() => {
                  const id = confirmDelete!
                  api.projects.delete(id)
                    .then(() => {
                      toast.success('Project deleted')
                      setItems(prev => prev.filter(p => p.id !== id))
                      setConfirmDelete(null)
                    })
                    .catch(err => toast.error(err.message))
                }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
