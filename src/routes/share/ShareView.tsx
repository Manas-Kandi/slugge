import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../lib/api'

export function ShareView() {
  const { token } = useParams()
  const [proj, setProj] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      if (!token) return
      try {
        const p = await api.share.publicProject(token)
        if (mounted) setProj(p)
      } catch (e: any) {
        setError('Invalid or expired link')
      }
    }
    run()
    return () => { mounted = false }
  }, [token])
  return (
    <div className="min-h-screen">
      <div className="max-w-[980px] mx-auto p-6">
        <div className="mb-4">
          <div className="text-sm text-text-secondary">Shared view</div>
          <h1 className="text-2xl font-semibold">{proj ? proj.name : 'Project'} (read‑only)</h1>
        </div>
        {error ? (
          <div className="card p-4 text-red-600">{error}</div>
        ) : (
          <div className="card p-4">
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div><span className="text-text-secondary">Token:</span> <span className="font-mono break-all">{token}</span></div>
              <div><span className="text-text-secondary">Project ID:</span> <span className="font-mono">{proj?.id}</span></div>
              <div><span className="text-text-secondary">Privacy:</span> {proj?.privacy}</div>
              <div><span className="text-text-secondary">Model:</span> {proj?.default_model}</div>
            </div>
          </div>
        )}
        <div className="card p-4 mt-3">
          <div className="text-sm text-text-secondary mb-2">Board preview</div>
          <div className="h-[480px] border border-dashed rounded-md"></div>
        </div>
      </div>
    </div>
  )
}
