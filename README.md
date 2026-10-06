# Goal Getters

A weekly exercise planner: set goals for the week, record what you achieve, and share plans with friends. Goals are private to the signed-in user.

Originally a web-development coursework project; rebuilt with a modern stack.

## Stack

- Node 22, TypeScript (ESM), Express 5
- SQLite (`better-sqlite3`): small relational data, per-user scoping, no database server to run
- Auth0 login via `express-openid-connect`
- Nunjucks views (auto-escaped), Bootstrap 5.3 + Bootstrap Icons served locally (strict CSP, no CDNs)
- Zod-validated configuration and form input, Nodemailer for sharing (rate-limited per user)
- Structured JSON logging with pino (`LOG_LEVEL` to tune), `/healthz` endpoint and Docker `HEALTHCHECK`
- Biome for lint and format, Vitest + Supertest, Playwright end-to-end tests, GitHub Actions CI, Docker

## Try it locally (no accounts needed)

```sh
cd app
npm install
npm run demo             # http://localhost:8080, signed in as a demo user
```

Demo mode skips Auth0 and only logs emails to the console; it refuses to start when `NODE_ENV=production`.

## Running locally with real Auth0

```sh
cd app
cp .env.example .env     # fill in your Auth0 details and a SESSION_SECRET
npm install
npm run dev              # http://localhost:8080
```

Auth0: create a *Regular Web Application* and add `http://localhost:8080/callback` as an allowed callback URL and `http://localhost:8080` as an allowed logout URL.

## Scripts (run in `app/`)

| Command | What it does |
| --- | --- |
| `npm run dev` | Run with reload, loading `.env` |
| `npm test` | Run the test suite |
| `npm run e2e` | Browser tests with Playwright (`npx playwright install chromium` once) |
| `npm run lint` / `lint:fix` | Lint and format check with Biome |
| `npm run typecheck` | Type-check without emitting |
| `npm run import-legacy` | Import goals from the old coursework database (see below) |
| `npm run build` / `npm start` | Compile to `dist/` and run it |

## Deploying

```sh
docker build -t goalgetters app
docker run -p 8080:8080 -v goalgetters-data:/data --env-file app/.env goalgetters
```

The SQLite file lives at `/data/goalgetters.db`. Mount a persistent volume there, because hosts with an ephemeral disk (e.g. Heroku dynos) will lose data. Set `BASE_URL` to the public URL and `TRUST_PROXY=true` behind a load balancer.

## Design notes

- Goal status (active / overdue / complete) is derived from dates at read time, so there is no background "overdue check" job.
- Every query is scoped to the Auth0 user id (`sub`); other users' goals return 404.
- State changes are `POST` only, with a same-origin check on top of Auth0's `SameSite=Lax` session cookie.

## Importing the original coursework data

The original app (Express 4 + NeDB + Mustache) was removed from the tree but remains in git history, together with its `newgoals.db` datafile. To bring those goals into the new database for an Auth0 user:

```sh
git show 40f602c:newgoals.db > /tmp/newgoals.db
cd app
npm run import-legacy -- /tmp/newgoals.db "auth0|YOUR_USER_ID" antony.lockhart
```

The last argument limits the import to one legacy username. Your Auth0 user id is shown in the Auth0 dashboard (Users). Design screenshots from the coursework are in `Images/`.
