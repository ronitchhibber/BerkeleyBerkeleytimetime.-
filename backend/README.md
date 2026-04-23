# Berkeleytime Sync Backend

Tiny Cloudflare Worker + Workers KV that lets users sync their Gradtrak plans + Schedule across devices. Free-tier hostable: 100k requests/day, 100k KV reads/day, 1k KV writes/day.

## Setup (one time)

```bash
cd backend
npm install
npx wrangler login                                    # auth with Cloudflare
npx wrangler kv namespace create SYNC_KV              # paste returned id into wrangler.toml
npx wrangler deploy                                   # → https://berkeleytime-sync.YOUR-SUBDOMAIN.workers.dev
```

Then in the frontend root:

```bash
echo "VITE_SYNC_API_URL=https://berkeleytime-sync.YOUR-SUBDOMAIN.workers.dev" >> .env
npm run build
```

That's it. With the env var set, the SyncStatus indicator in the navbar turns active and the app auto-syncs every 5s after changes.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/user` | Mint a new userId (UUID). Frontend calls once on first load and stores it in localStorage. |
| `POST` | `/api/sync` | Body `{ userId, plans, schedule }`. Persists state. Returns `{ syncedAt }`. |
| `GET` | `/api/sync/:userId` | Returns `{ plans, schedule, syncedAt }` or 404. |

## Auth model

userId is the bearer token. Whoever has it can read/write that user's state. This is single-user-per-device — fine for personal sync, NOT real multi-user auth. CalNet OAuth integration is a future task.

## Rate limit

60 sync writes per userId per hour. Returns 429 if exceeded.

## Local dev

```bash
npx wrangler dev    # runs at http://localhost:8787
```

Then in frontend `.env.local`:
```
VITE_SYNC_API_URL=http://localhost:8787
```
