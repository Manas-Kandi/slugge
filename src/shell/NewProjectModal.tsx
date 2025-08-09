import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnapshot } from 'valtio'
import { state } from '../lib/store'
import { slugify } from '../lib/utils'
import { toast } from 'sonner'
import { api } from '../lib/api'

export function NewProjectModal() {
  const s = useSnapshot(state)
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [privacy, setPrivacy] = useState<'org' | 'private'>('org')
  const [language, setLanguage] = useState('en')
  const [model, setModel] = useState<'OpenAI' | 'Gemini'>('OpenAI')
  const [budget, setBudget] = useState('20')
  const [autoStart, setAutoStart] = useState(true)

  useEffect(() => {
    if (!s.newProjectOpen) {
      setName(''); setSlug(''); setPrivacy('org'); setLanguage('en'); setModel('OpenAI'); setBudget('20'); setAutoStart(true)
    }
  }, [s.newProjectOpen])

  const canSubmit = useMemo(() => name.trim().length > 1, [name])

  if (!s.newProjectOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh]" onClick={() => (state.newProjectOpen = false)}>
      <div className="card w-full max-w-lg" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border">
          <div className="text-lg font-medium">New Project</div>
          <div className="text-sm text-text-secondary">Name, privacy and defaults</div>
        </div>
        <form className="p-4 grid gap-3" onSubmit={async (e) => {
          e.preventDefault()
          if (!canSubmit) { toast.error('Enter a project name'); return }
          try {
            const payload = { name: name.trim(), slug: slug || slugify(name), privacy, default_language: language, default_model: model, budget_cap: Number(budget || '0'), auto_start: autoStart }
            const created = await api.projects.create(payload)
            toast.success('Project created')
            state.newProjectOpen = false
            const pid = (created as any).id || payload.slug
            nav(`/app/projects/${pid}/overview`)
          } catch (err: any) {
            toast.error(err.message || 'Failed to create project')
          }
        }}>
          <label className="text-sm">Name
            <input className="input mt-1" value={name} onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)) }} placeholder="eg. Checkout Usability" />
          </label>
          <label className="text-sm">Slug
            <input className="input mt-1" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Privacy
              <select className="input mt-1" value={privacy} onChange={(e) => setPrivacy(e.target.value as any)}>
                <option value="org">Organization</option>
                <option value="private">Private</option>
              </select>
            </label>
            <label className="text-sm">Default language
              <select className="input mt-1" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Default model
              <select className="input mt-1" value={model} onChange={(e) => setModel(e.target.value as any)}>
                <option>OpenAI</option>
                <option>Gemini</option>
              </select>
            </label>
            <label className="text-sm">Budget cap ($)
              <input type="number" className="input mt-1" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </label>
          </div>
          <label className="text-sm inline-flex items-center gap-2">
            <input type="checkbox" checked={autoStart} onChange={(e) => setAutoStart(e.target.checked)} /> Auto‑Start Pipeline
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="btn btn-ghost" onClick={() => (state.newProjectOpen = false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}
