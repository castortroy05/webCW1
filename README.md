# Goal Getters

A weekly exercise planner: set goals for the week, record what you achieve, and share plans with friends. Goals are private to the signed-in user.

Originally a web-development coursework project; rebuilt with a modern stack.

## Stack

- Node 22, TypeScript (ESM), Express 5
- SQLite (`better-sqlite3`): small relational data, per-user scoping, no database server to run
- Auth0 login via `express-openid-connect`
- Nunjucks views (auto-escaped), Bootstrap 5.3 + Bootstrap Icons served locally (strict CSP, no CDNs)
- Zod-validated configuration and form input, Nodemailer for sharing
- Vitest + Supertest, GitHub Actions CI, Docker

## Running locally

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
| `npm run typecheck` | Type-check without emitting |
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

## Legacy code

The original coursework implementation (Express 4 + NeDB + Mustache) is still in the repository root (`index.js`, `controllers/`, `models/`, `routes/`, `views/`) for reference and can be deleted. Its design screenshots are in `Images/`.
