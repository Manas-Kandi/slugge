import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { titleize } from '../../../lib/utils'
import { BoardCanvas } from './BoardCanvas'
import { api } from '../../../lib/api'
import { toast } from 'sonner'

export function ProjectLayout() {
  const { id } = useParams()
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  useEffect(() => {
    let mounted = true
    if (!id) return
    setLoading(true)
    api.projects.get(id)
      .then((p) => { if (mounted) setName((p as any).name) })
      .catch(() => { /* ignore for now */ })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])
  const tabs = [
    'overview','ingest','processing','atoms','themes','insights','board','publish','settings'
  ]
  return (
    <div>
      <div className="mb-3">
        <div className="text-sm text-text-secondary">Project</div>
        <h1 className="text-2xl font-semibold">{loading ? 'Loading…' : (name || `Project ${id}`)}</h1>
      </div>
      <div className="border-b border-border mb-4">
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map(t => (
            <NavLink key={t} to={t === 'overview' ? './overview' : `./${t}`} className={({isActive}) => 
              `px-3 py-2 text-sm rounded-t-md ${isActive ? 'bg-white border border-border border-b-white -mb-px' : 'text-text-secondary hover:text-text'}`
            }>{titleize(t)}</NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}

export const ProjectOverview = () => (
  <div className="grid md:grid-cols-3 gap-4">
    <div className="card p-4"><div className="text-sm text-text-secondary">Docs</div><div className="text-2xl font-semibold">6</div></div>
    <div className="card p-4"><div className="text-sm text-text-secondary">Atoms</div><div className="text-2xl font-semibold">1,284</div></div>
    <div className="card p-4"><div className="text-sm text-text-secondary">Themes</div><div className="text-2xl font-semibold">12</div></div>
  </div>
)

export const Ingest = () => {
  const { id } = useParams()
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const fmtSize = (n: number) => {
    if (n > 1e6) return `${(n / 1e6).toFixed(1)}MB`
    if (n > 1e3) return `${(n / 1e3).toFixed(1)}KB`
    return `${n}B`
  }

  const refresh = async () => {
    if (!id) return
    setLoading(true)
    try {
      const rows = await api.documents.list(id)
      setDocs(rows)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [id])

  const pick = () => fileRef.current?.click()

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0]
    if (!f || !id) return
    setUploading(true)
    try {
      await api.documents.upload(id, f)
      toast.success('Uploaded')
      await refresh()
    } catch (err: any) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.currentTarget.value = ''
    }
  }

  const removeDoc = async (docId: string) => {
    if (!id) return
    try {
      await api.documents.delete(id, docId)
      toast.success('Removed')
      await refresh()
    } catch (err) {
      toast.error('Failed to remove')
    }
  }

  const startPipeline = async () => {
    if (!id) return
    try {
      await api.processing.start(id)
      toast.success('Processing started')
    } catch (err) {
      toast.error('Failed to start')
    }
  }

  return (
    <div className="space-y-3">
      <div className="card p-6">
        <div className="text-sm mb-2">Drop transcripts</div>
        <div
          className="border border-dashed border-border rounded-lg p-12 text-center text-text-secondary cursor-pointer"
          onClick={pick}
        >
          {uploading ? 'Uploading…' : 'Drag & drop or click to upload'}
        </div>
        <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
        <div className="mt-3 flex justify-end"><button className="btn btn-primary" onClick={startPipeline}>Start pipeline</button></div>
      </div>
      <div className="card p-4">
        <div className="font-medium mb-2">Files</div>
        <table className="w-full text-sm">
          <thead><tr className="text-text-secondary"><th className="text-left py-1">Name</th><th>Status</th><th>Size</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4 text-text-secondary">Loading…</td></tr>
            ) : docs.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-text-secondary">No files yet</td></tr>
            ) : docs.map(d => (
              <tr key={d.id} className="border-t border-border">
                <td className="py-1">{d.file_name}</td>
                <td>{d.status}</td>
                <td>{fmtSize(d.size)}</td>
                <td className="text-right"><button className="btn btn-ghost" onClick={() => removeDoc(d.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const Processing = () => {
  const { id } = useParams()
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('Idle')
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    let timer: any
    const tick = async () => {
      if (!id) return
      try {
        const s = await api.processing.status(id)
        if (!mounted) return
        setProgress(s.progress)
        setStage(s.stage)
        setEvents(s.events || [])
      } catch (e) { /* ignore */ }
    }
    tick()
    timer = setInterval(tick, 1000)
    return () => { mounted = false; clearInterval(timer) }
  }, [id])

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 card p-4">
        <div className="font-medium mb-2">Stage</div>
        <div className="w-full h-2 bg-surface rounded"><div className="h-2 bg-accent rounded" style={{width: `${Math.round(progress*100)}%`}}/></div>
        <div className="text-sm text-text-secondary mt-1">{stage}… {Math.round(progress*100)}%</div>
      </div>
      <div className="card p-4">
        <div className="font-medium mb-2">Events</div>
        <div className="text-sm text-text-secondary space-y-1 max-h-[300px] overflow-auto pr-2">
          {events.length === 0 ? <div>No events yet</div> : events.map((e,i) => <div key={i}>{e}</div>)}
        </div>
      </div>
    </div>
  )
}

export const Atoms = () => (
  <div className="grid md:grid-cols-2 gap-4">
    <div className="card p-4">
      <div className="font-medium mb-2">Transcript</div>
      <div className="text-sm text-text-secondary h-[480px] overflow-auto pr-2">
        <p><b>User:</b> I couldn’t find settings…</p>
      </div>
    </div>
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Atoms</div>
        <div className="text-sm text-text-secondary">Filter</div>
      </div>
      <div className="space-y-2 h-[480px] overflow-auto pr-2">
        <div className="border border-border rounded-md p-3">
          <div className="text-sm">User struggled to find settings during onboarding.</div>
          <div className="mt-2 flex gap-2 text-xs"><span className="px-2 py-0.5 rounded bg-surface border">onboarding</span><span className="px-2 py-0.5 rounded bg-surface border">frustration</span></div>
        </div>
      </div>
    </div>
  </div>
)

export const Themes = () => (
  <div className="card p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="font-medium">Themes</div>
      <div className="flex gap-2"><button className="btn btn-ghost">Auto‑regroup</button><button className="btn btn-primary">Checkpoint #1</button></div>
    </div>
    <div className="grid md:grid-cols-3 gap-3">
      <div className="border rounded-md p-3">
        <div className="font-medium">Onboarding confusion</div>
        <div className="text-sm text-text-secondary">15 atoms</div>
      </div>
    </div>
  </div>
)

export const Insights = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="font-medium">Insights</div>
      <button className="btn btn-primary">Generate from themes</button>
    </div>
    <div className="card p-4">
      <div className="font-medium">Users miss settings</div>
      <div className="text-sm text-text-secondary">Backed by 5 atoms</div>
    </div>
  </div>
)

export const Board = () => {
  const { id } = useParams()
  return (
    <BoardCanvas projectId={id ?? 'unknown'} />
  )
}

export const Publish = () => {
  const { id } = useParams()
  const [url, setUrl] = useState<string | null>(null)

  const mint = async () => {
    if (!id) return
    try {
      const { url } = await api.share.mint(id)
      setUrl(url)
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied to clipboard')
    } catch (e) {
      toast.error('Failed to create link')
    }
  }

  return (
    <div className="space-y-3">
      <div className="card p-4">
        <div className="font-medium mb-2">Share</div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={mint}>Create link</button>
          <button className="btn btn-ghost" onClick={mint}>Regenerate</button>
        </div>
        {url && (
          <div className="text-sm text-text-secondary mt-2 break-all">{url}</div>
        )}
      </div>
      <div className="card p-4">
        <div className="font-medium mb-2">PII Summary</div>
        <div className="text-sm text-text-secondary">0 items detected</div>
      </div>
    </div>
  )
}

export const ProjectSettings = () => (
  <div className="grid md:grid-cols-2 gap-3">
    <div className="card p-4">
      <div className="font-medium mb-2">Models</div>
      <div className="grid gap-2">
        <select className="input"><option>OpenAI</option><option>Gemini</option></select>
        <input className="input" placeholder="Budget cap ($)" type="number" />
      </div>
    </div>
    <div className="card p-4">
      <div className="font-medium mb-2">Privacy</div>
      <div className="grid gap-2">
        <select className="input"><option>Standard</option><option>Strict</option></select>
        <label className="text-sm flex items-center gap-2"><input type="checkbox" /> Redact PII before LLM</label>
      </div>
    </div>
  </div>
)
