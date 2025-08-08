import { useParams } from 'react-router-dom'

export function ShareView() {
  const { token } = useParams()
  return (
    <div className="min-h-screen">
      <div className="max-w-[980px] mx-auto p-6">
        <div className="mb-4">
          <div className="text-sm text-text-secondary">Shared view</div>
          <h1 className="text-2xl font-semibold">Project (read‑only)</h1>
        </div>
        <div className="card p-4">
          <div className="text-sm text-text-secondary">Token:</div>
          <div className="font-mono text-sm break-all">{token}</div>
        </div>
        <div className="card p-4 mt-3">
          <div className="text-sm text-text-secondary mb-2">Board preview</div>
          <div className="h-[480px] border border-dashed rounded-md"></div>
        </div>
      </div>
    </div>
  )
}
