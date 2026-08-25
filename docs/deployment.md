# Deployment

The production deployment is configured for Vercel from the repository root.
Vercel builds the full pnpm workspace so `frontend/dist` is published as the
static app and `api/[...path].js` can load the compiled Express backend from
`backend/dist`.

## Vercel Settings

Use the repository root as the Vercel project root.

Required build settings:

```text
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm build
Output Directory: frontend/dist
```

The root `vercel.json` keeps these settings in source control.

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
