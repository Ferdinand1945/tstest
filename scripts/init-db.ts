import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

const INIT_SQL_PATH = join(process.cwd(), "db_schema", "init.sql");

export function loadInitSql(): string {
  return readFileSync(INIT_SQL_PATH, "utf8");
}

export async function runInitSql(client: Client): Promise<void> {
  await client.query(loadInitSql());
}

async function main() {
  const admin = new Client({
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USER ?? "postgres",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_ADMIN_DB ?? "postgres",
  });
  await admin.connect();

  const dbName = process.env.DATABASE_NAME ?? "transiett_db";
  try {
    await admin.query(`CREATE DATABASE ${quoteIdent(dbName)}`);
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code !== "42P04"
    ) {
      throw err;
    }
  }
  await admin.end();

  const client = new Client({
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USER ?? "postgres",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: dbName,
  });
  await client.connect();

  const exists = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns'`,
  );
  if (exists.rowCount) {
    console.log(`Database already initialized: ${dbName}`);
    await client.end();
    return;
  }

  await runInitSql(client);
  await client.end();
  console.log(`Database initialized from db_schema/init.sql: ${dbName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

function quoteIdent(name: string): string {
  return `"${name.replaceAll("\"", "\"\"")}"`;
}
