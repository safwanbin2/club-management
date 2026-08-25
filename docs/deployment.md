# Deployment

The production deployment is configured for Vercel from the repository root.
Vercel builds the full pnpm workspace so `frontend/dist` is published as the
static app and `api/[...path].js` can load the compiled Express backend from
`backend/dist`.

## Root Deployment

Use these settings when frontend and backend are deployed together from the
repository root.

Vercel project settings:

```text
Root Directory: .
Framework Preset: Other
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm build
Output Directory: frontend/dist
```

The root `vercel.json` keeps these settings in source control and pins
`framework` to `null` so Vercel does not auto-detect the backend workspace as an
Express-only deployment.

## Separate Backend Deployment

Use these settings when the frontend already deploys from `frontend/` and the
backend has its own Vercel project.

Vercel project settings:

```text
Root Directory: backend
Framework Preset: Other
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm build
Output Directory: leave empty
```

The backend `vercel.json` also sets `outputDirectory` to `null`. This prevents
Vercel from reusing a frontend output directory such as `frontend/dist` while it
is building the backend package.

The backend API function lives at `backend/api/[...path].js`, so backend routes
are served under `/api/*` on the backend deployment domain.

## Environment Variables

Set these in the Vercel project:

```text
NODE_ENV=production
MONGODB_URI=<your MongoDB Atlas connection string>
ACCESS_TOKEN_SECRET=<at least 16 random characters>
```

For the frontend and backend in the same Vercel deployment, leave
`VITE_API_URL` unset. The production frontend defaults to same-origin `/api`,
which avoids cross-origin requests.

For separate frontend and backend deployments:

```text
# Frontend project
VITE_API_URL=https://<backend-domain>/api

# Backend project
FRONTEND_ORIGIN=https://<frontend-domain>
FRONTEND_ORIGINS=https://<preview-domain-1>,https://<preview-domain-2>
```

Use `FRONTEND_ORIGINS` only for additional comma-separated frontend origins.
Do not use wildcard CORS with credentialed requests.

## Smoke Test

After deployment, check:

```bash
curl https://<deployment-domain>/api/health
```

The response should include `status: "success"` and
`service: "university-club-management-api"`.
