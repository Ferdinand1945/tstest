import { Client } from "pg";
import { getSequelize } from "../lib/db";
import "../lib/models";

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

  const sequelize = getSequelize();
  await sequelize.authenticate();
  await sequelize.sync();
  await sequelize.close();
  console.log(`Database initialized: ${dbName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

function quoteIdent(name: string): string {
  return `"${name.replaceAll("\"", "\"\"")}"`;
}
