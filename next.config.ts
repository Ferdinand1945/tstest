import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["sequelize", "pg", "pg-hstore"],

  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/pg/**/*",
      "./node_modules/pg-hstore/**/*",
      "./node_modules/sequelize/**/*",
    ],
  },
};

export default nextConfig;
