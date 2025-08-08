import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="max-w-2xl text-center px-6">
        <h1 className="text-4xl font-semibold tracking-tight mb-3">Evidence‑first research synthesis</h1>
        <p className="text-text-secondary mb-6">Slugge turns raw transcripts into a live, inspectable board with full traceability. Human‑in‑the‑loop by design.</p>
        <div className="flex items-center justify-center gap-3">
          <Link className="btn btn-primary" to="/auth/signup">Start free</Link>
          <a className="btn btn-ghost" href="https://example.com/docs" target="_blank" rel="noreferrer">Docs</a>
        </div>
      </div>
    </div>
  )
}
