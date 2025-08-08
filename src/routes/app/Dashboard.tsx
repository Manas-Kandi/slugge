import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useSnapshot } from 'valtio'
import { state } from '../../lib/store'
import { toast } from 'sonner'

const demo = [
  { id: 'p1', name: 'Checkout Usability', updated: '2d', status: 'Needs review', docs: 6, cost: '$3.84' },
  { id: 'p2', name: 'Onboarding Interviews', updated: '5d', status: 'Ready', docs: 4, cost: '$2.10' }
]

export function Dashboard() {
  const s = useSnapshot(state)
  const [sort, setSort] = useState<'recent' | 'name'>('recent')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = s.searchQuery.toLowerCase().trim()
    let arr = demo.filter(p => p.name.toLowerCase().includes(q))
    if (sort === 'name') arr = [...arr].sort((a, b) => a.name.localeCompare(b.name))
    return arr
  }, [s.searchQuery, sort])

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
      {filtered.length === 0 ? (
        <div className="card p-6 text-center">
          <div className="text-text-secondary">Create a project to begin.</div>
          <button className="btn btn-primary mt-3" onClick={() => (state.newProjectOpen = true)}>New Project</button>
        </div>
      ) : s.viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => (
            <div key={p.id} className="card p-4 hover:shadow-soft2 transition group">
              <Link to={`/app/projects/${p.id}/overview`} className="font-medium block">{p.name}</Link>
              <div className="text-sm text-text-secondary mt-1">{p.docs} docs · {p.cost}</div>
              <div className="mt-2 text-xs">{p.status} • updated {p.updated} ago</div>
              <div className="opacity-0 group-hover:opacity-100 transition mt-3 flex gap-2 text-sm">
                <Link to={`/app/projects/${p.id}/overview`} className="btn btn-ghost">Open</Link>
                <button className="btn btn-ghost" onClick={() => toast.success('Duplicated')}>Duplicate</button>
                <button className="btn btn-ghost" onClick={() => toast('Archived')}>Archive</button>
                <button className="btn btn-ghost text-danger" onClick={() => setConfirmDelete(p.id)}>Delete</button>
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
                  <td>{p.status}</td>
                  <td>{p.docs}</td>
                  <td>{p.cost}</td>
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
                <button id="confirm-btn" className="btn btn-primary" disabled onClick={() => { toast.success('Project deleted'); setConfirmDelete(null) }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
