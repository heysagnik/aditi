import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { config } from "dotenv";
config({ path: ".env.local" });

/**
 * Neon serverless driver (HTTP — ideal for serverless / edge).
 * Reads DATABASE_URL at runtime so it works in dev and on Vercel.
 */
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
