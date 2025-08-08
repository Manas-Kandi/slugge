import { Outlet, Link, useNavigate } from 'react-router-dom'
import { state } from '../../lib/store'

export function AuthLayout() {
  return (
    <div className="min-h-screen grid place-items-center bg-surface">
      <div className="w-full max-w-md p-6 card">
        <div className="text-center mb-4">
          <Link to="/" className="font-semibold">slugge</Link>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export function Login() {
  const nav = useNavigate()
  return (
    <form className="space-y-3" onSubmit={(e) => {
      e.preventDefault()
      // stub: mark user as signed in and go to app
      state.user = { id: 'demo', email: 'demo@slugge.dev', name: 'Demo User' }
      nav('/app')
    }}>
      <div className="text-lg font-medium">Sign in</div>
      <button
        type="button"
        className="btn w-full btn-ghost"
        onClick={() => { state.user = { id: 'demo', email: 'demo@slugge.dev', name: 'Demo User' }; nav('/app') }}
      >
        Continue with Google
      </button>
      <div className="grid gap-2">
        <input className="input" placeholder="Email" type="email" />
        <input className="input" placeholder="Password" type="password" />
      </div>
      <button type="submit" className="btn btn-primary w-full">Sign in</button>
      <div className="text-right text-sm">
        <Link to="/auth/forgot" className="text-accent">Forgot password?</Link>
      </div>
      <div className="text-sm text-text-secondary">No account? <Link className="text-accent" to="/auth/signup">Create one</Link></div>
    </form>
  )
}

export function Signup() {
  const nav = useNavigate()
  return (
    <form className="space-y-3" onSubmit={(e) => {
      e.preventDefault()
      // stub: mark user as signed in and go to app
      state.user = { id: 'demo', email: 'demo@slugge.dev', name: 'Demo User' }
      nav('/app')
    }}>
      <div className="text-lg font-medium">Create account</div>
      <div className="grid gap-2">
        <input className="input" placeholder="Name" />
        <input className="input" placeholder="Email" type="email" />
        <input className="input" placeholder="Password" type="password" />
        <input className="input" placeholder="Organization" />
      </div>
      <button type="submit" className="btn btn-primary w-full">Create account</button>
      <div className="text-sm text-text-secondary">Have an invite code? <a className="text-accent" href="#">Enter code</a></div>
    </form>
  )
}

export function MagicLink() {
  return (
    <div className="space-y-3">
      <div className="text-lg font-medium">Check your email</div>
      <p className="text-sm text-text-secondary">We sent a sign‑in link. Click it to continue.</p>
    </div>
  )
}

export function Forgot() {
  return (
    <form className="space-y-3">
      <div className="text-lg font-medium">Reset password</div>
      <input className="input" placeholder="Email" type="email" />
      <button className="btn btn-primary w-full">Send reset link</button>
    </form>
  )
}
