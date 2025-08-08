# slugge — frontend

Light, hyper‑minimal React + Vite app for evidence‑first UX research synthesis.

## Quick start
```bash
pnpm i # or npm install / yarn
cp .env.example .env.local
pnpm dev
```
Open http://localhost:5173

## What’s included
- React + Vite + TypeScript
- Tailwind (tokens from PRD)
- Routing (react-router)
- Shell (header, sidebar, assistant panel placeholder)
- Screens per PRD: auth, dashboard, project tabs, settings, billing (Stripe/PayPal stubs), share
- tldraw dependency ready (canvas placeholder in Board)

## Env vars
- `VITE_API_BASE_URL` — FastAPI gateway (http://localhost:8000)
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
- `VITE_PAYPAL_CLIENT_ID` — PayPal client id (sandbox: `sb`)
- `VITE_SHARE_BASE_URL` — base for share links

## Next steps
- Wire API calls to your FastAPI endpoints
- Replace placeholders with live data
- Add Assistant panel (WS + retrieval)
