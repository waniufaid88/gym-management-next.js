import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const url = process.env.DATABASE_URL;

if (url === undefined) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  casing: "snake_case",
});
