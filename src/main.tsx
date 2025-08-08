import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AppShell } from './shell/AppShell'
import { Landing } from './routes/Landing'
import { AuthLayout, Login, Signup, MagicLink, Forgot } from './routes/auth'
import { Dashboard } from './routes/app/Dashboard'
import { ProjectLayout, ProjectOverview, Ingest, Processing, Atoms, Themes, Insights, Board, Publish, ProjectSettings } from './routes/app/project'
import { SettingsLayout, Account, Organization, Billing, Integrations, Security } from './routes/app/settings'
import { ShareView } from './routes/share/ShareView'
import { Toaster } from 'sonner'
import { state } from './lib/store'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/auth', element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'magic', element: <MagicLink /> },
      { path: 'forgot', element: <Forgot /> }
    ]
  },
  { path: '/app', element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'projects/:id', element: <ProjectLayout />,
        children: [
          { index: true, element: <ProjectOverview /> },
          { path: 'overview', element: <ProjectOverview /> },
          { path: 'ingest', element: <Ingest /> },
          { path: 'processing', element: <Processing /> },
          { path: 'atoms', element: <Atoms /> },
          { path: 'themes', element: <Themes /> },
          { path: 'insights', element: <Insights /> },
          { path: 'board', element: <Board /> },
          { path: 'publish', element: <Publish /> },
          { path: 'settings', element: <ProjectSettings /> }
        ]}
    ]},
  { path: '/app/settings', element: <SettingsLayout />,
    children: [
      { index: true, element: <Account /> },
      { path: 'organization', element: <Organization /> },
      { path: 'billing', element: <Billing /> },
      { path: 'integrations', element: <Integrations /> },
      { path: 'security', element: <Security /> }
    ]
  },
  { path: '/share/:token', element: <ShareView /> }
])

function Bootstrap() {
  useEffect(() => {
    // Simulate auth/bootstrap complete
    state.loading = false
  }, [])
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors expand />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Bootstrap />)
