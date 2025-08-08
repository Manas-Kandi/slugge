import { NavLink, Outlet, useParams } from 'react-router-dom'
import { titleize } from '../../../lib/utils'
import { BoardCanvas } from './BoardCanvas'

export function ProjectLayout() {
  const { id } = useParams()
  const tabs = [
    'overview','ingest','processing','atoms','themes','insights','board','publish','settings'
  ]
  return (
    <div>
      <div className="mb-3">
        <div className="text-sm text-text-secondary">Project</div>
        <h1 className="text-2xl font-semibold">Project {id}</h1>
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

export const Ingest = () => (
  <div className="space-y-3">
    <div className="card p-6">
      <div className="text-sm mb-2">Drop transcripts</div>
      <div className="border border-dashed border-border rounded-lg p-12 text-center text-text-secondary">Drag & drop or click to upload</div>
      <div className="mt-3 flex justify-end"><button className="btn btn-primary">Start pipeline</button></div>
    </div>
    <div className="card p-4">
      <div className="font-medium mb-2">Files</div>
      <table className="w-full text-sm">
        <thead><tr className="text-text-secondary"><th className="text-left py-1">Name</th><th>Status</th><th>Size</th><th/></tr></thead>
        <tbody><tr><td>interview-01.pdf</td><td>Uploaded</td><td>2.1MB</td><td className="text-right"><button className="btn btn-ghost">Remove</button></td></tr></tbody>
      </table>
    </div>
  </div>
)

export const Processing = () => (
  <div className="grid md:grid-cols-3 gap-4">
    <div className="md:col-span-2 card p-4">
      <div className="font-medium mb-2">Stage</div>
      <div className="w-full h-2 bg-surface rounded"><div className="h-2 bg-accent rounded" style={{width: '38%'}}/></div>
      <div className="text-sm text-text-secondary mt-1">Normalizing transcripts… 38%</div>
    </div>
    <div className="card p-4">
      <div className="font-medium mb-2">Events</div>
      <div className="text-sm text-text-secondary space-y-1">
        <div>Removed 53 filler words</div>
        <div>Standardized 5 speaker names</div>
      </div>
    </div>
  </div>
)

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

export const Publish = () => (
  <div className="space-y-3">
    <div className="card p-4">
      <div className="font-medium mb-2">Share</div>
      <div className="flex gap-2">
        <button className="btn btn-primary">Create link</button>
        <button className="btn btn-ghost">Regenerate</button>
      </div>
    </div>
    <div className="card p-4">
      <div className="font-medium mb-2">PII Summary</div>
      <div className="text-sm text-text-secondary">0 items detected</div>
    </div>
  </div>
)

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
