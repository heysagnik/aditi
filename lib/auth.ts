import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

/**
 * Server-side Better Auth instance.
 *
 * The Drizzle adapter receives our db instance so that Better Auth
 * can read/write the user / session / verification tables directly.
 *
 * We enable only email+password. Social logins can be added later
 * via the better-auth plugin system.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    }
  }),
  emailAndPassword: {
    enabled: true,
  },
});
