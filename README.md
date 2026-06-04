# Transiett — Code test

## Setup

1. PostgreSQL on port **5432** with database **`transiett_db`** (created automatically by init script).

2. Copy env and adjust credentials:

```bash
cp .env.example .env.local
```

3. Initialize schema (runs `db_schema/init.sql`):

```bash
npm run db:init
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

Requires [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
docker compose up --build
```

- **App:** http://localhost:3000
- **Postgres:** `localhost:5432` (user/password: `postgres` / `postgres`, database: `transiett_db`)

On first start, Postgres runs **`db_schema/init.sql`** automatically (schema + seed data). Init scripts only run on a **fresh volume**.

| Service | Role |
|---------|------|
| `postgres` | PostgreSQL 16 + `init.sql` on first boot |
| `app` | Next.js production server |

Reset DB (re-run init.sql): `docker compose down -v && docker compose up --build`

## Tests (Vitest + React Testing Library)

```bash
npm run test:run    # single run
npm run test        # watch mode
```

E2E: `npx playwright test` (Playwright is installed separately).

Requires PostgreSQL running and schema initialized:

```bash
npm run benchmark
```

