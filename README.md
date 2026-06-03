# Transiett — Voucher campaigns

Simple TypeScript app (Next.js + PostgreSQL + Sequelize) to manage voucher campaigns and generate unique discount codes.

## Setup

1. PostgreSQL on port **5432** with database **`transiett_db`** (created automatically by init script).

2. Copy env and adjust credentials:

```bash
cp .env.example .env.local
```

3. Initialize schema:

```bash
npm run db:init
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| DELETE | `/api/campaigns/:id` | Delete campaign (cascades vouchers) |
| GET | `/api/campaigns/:id/vouchers` | List vouchers (`limit`, `offset`) |
| POST | `/api/campaigns/:id/vouchers` | Batch create `{ "count": N }` |
| GET | `/api/campaigns/:id/vouchers/export` | Download CSV |

Requires PostgreSQL running and schema initialized:

```bash
npm run benchmark
```

