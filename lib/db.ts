import { Sequelize } from "sequelize";

const globalForDb = globalThis as unknown as {
  sequelize: Sequelize | undefined;
};

export function getSequelize(): Sequelize {
  if (!globalForDb.sequelize) {
    globalForDb.sequelize = new Sequelize({
      dialect: "postgres",
      host: process.env.DATABASE_HOST ?? "127.0.0.1",
      port: Number(process.env.DATABASE_PORT ?? 5432),
      username: process.env.DATABASE_USER ?? "postgres",
      password: process.env.DATABASE_PASSWORD ?? "",
      database: process.env.DATABASE_NAME ?? "transiett_db",
      logging: false,
      pool: { max: 10 },
    });
  }
  return globalForDb.sequelize;
}
