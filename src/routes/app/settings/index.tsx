import { NavLink, Outlet } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

export function SettingsLayout() {
  const tabs = [
    { path: '.', label: 'Account' },
    { path: 'organization', label: 'Organization' },
    { path: 'billing', label: 'Billing' },
    { path: 'integrations', label: 'Integrations' },
    { path: 'security', label: 'Security' }
  ]
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Settings</h1>
      <div className="border-b border-border mb-4">
        <nav className="flex gap-2">
          {tabs.map(t => (
            <NavLink key={t.path} end={t.path==='.'} to={t.path} className={({isActive}) => 
              `px-3 py-2 text-sm rounded-t-md ${isActive ? 'bg-white border border-border border-b-white -mb-px' : 'text-text-secondary hover:text-text'}`
            }>{t.label}</NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}

export const Account = () => (
  <div className="grid md:grid-cols-2 gap-3">
    <div className="card p-4">
      <div className="font-medium mb-2">Profile</div>
      <div className="grid gap-2">
        <input className="input" placeholder="Name" />
        <input className="input" placeholder="Email" />
        <button className="btn btn-primary w-fit">Save</button>
      </div>
    </div>
    <div className="card p-4">
      <div className="font-medium mb-2">Security</div>
      <div className="grid gap-2">
        <input className="input" placeholder="New password" type="password"/>
        <button className="btn btn-ghost w-fit">Enable 2FA</button>
      </div>
    </div>
  </div>
)

export const Organization = () => (
  <div className="card p-4">
    <div className="font-medium mb-2">Organization</div>
    <div className="grid md:grid-cols-2 gap-2">
      <input className="input" placeholder="Org name" />
      <input className="input" placeholder="Allowed domains (comma separated)" />
    </div>
  </div>
)

export function Billing() {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)
  return (
    <div className="grid md:grid-cols-3 gap-3">
      <div className="md:col-span-2 card p-4">
        <div className="font-medium mb-2">Plans</div>
        <div className="grid md:grid-cols-3 gap-3">
          {['Free','Pro','Tester Unlimited'].map(plan => (
            <div key={plan} className="border rounded-md p-3">
              <div className="font-medium">{plan}</div>
              <div className="text-sm text-text-secondary mb-3">{plan==='Free'?'Good for trials': plan==='Pro'?'For teams':'Invite‑only'}</div>
              <button className="btn btn-primary w-full">Choose</button>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-4">
        <div className="font-medium mb-2">Payment Methods</div>
        <div className="text-sm text-text-secondary mb-2">Stripe & PayPal supported.</div>
        <PayPalScriptProvider options={{ 'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID as string }}>
          <div className="text-sm">PayPal connected (sandbox)</div>
        </PayPalScriptProvider>
        <button className="btn btn-ghost mt-2 w-full">Open Stripe Customer Portal</button>
      </div>
    </div>
  )
}

export const Integrations = () => (
  <div className="card p-4">
    <div className="font-medium mb-2">Integrations</div>
    <div className="grid md:grid-cols-2 gap-2">
      <label className="text-sm">Slack webhook<input className="input" placeholder="https://hooks.slack.com/..." /></label>
      <label className="text-sm">Notion API key<input className="input" placeholder="secret_xxx" /></label>
    </div>
  </div>
)

export const Security = () => (
  <div className="card p-4">
    <div className="font-medium mb-2">Security</div>
    <div className="grid md:grid-cols-2 gap-2">
      <label className="text-sm">SSO domains<input className="input" placeholder="company.com" /></label>
      <div className="text-sm text-text-secondary">Audit log export (coming soon)</div>
    </div>
  </div>
)
