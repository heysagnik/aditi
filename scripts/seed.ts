/**
 * scripts/seed.ts
 *
 * Creates the first admin user from environment variables.
 * Run with:  npx tsx scripts/seed.ts
 *
 * Requires DATABASE_URL, BETTER_AUTH_SECRET, SEED_ADMIN_EMAIL,
 * SEED_ADMIN_PASSWORD, and SEED_ADMIN_NAME in .env.local.
 *
 * We use `dotenv` inline rather than a dev-dependency — Next.js
 * already loads .env.local via its own mechanism, but the seed
 * script runs outside Next, so we read the file manually.
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../lib/db";
import { user } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Aditi Admin";

  if (!email || !password) {
    console.error(
      "❌  Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local"
    );
    process.exit(1);
  }

  // Check if user already exists
  const [existing] = await db.select().from(user).where(eq(user.email, email));
  if (existing) {
    console.log(`Deleting existing admin user to recreate with Better Auth mapping...`);
    await db.delete(user).where(eq(user.email, email));
  }

  try {
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      }
    });

    if (res?.user?.id) {
      // Ensure the user has admin role
      await db.update(user).set({ role: "admin" }).where(eq(user.id, res.user.id));
      console.log(`✅  Admin user "${email}" created (id=${res.user.id}).`);
    } else {
      console.error("❌  Failed to create admin user.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌  Failed to create admin user via Better Auth:", error);
    process.exit(1);
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
