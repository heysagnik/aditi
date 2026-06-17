import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, session } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

/**
 * Verify the current session and return the authenticated user.
 *
 * Wraps the result with React `cache()` so that within a single
 * React render pass the DB is queried at most once.
 *
 * Returns null for unauthenticated requests — callers decide
 * whether to redirect or render a login prompt.
 */
export const getCurrentUser = cache(async () => {
  const reqHeaders = await import("next/headers").then(m => m.headers());
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user) return null;

  const [u] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, session.user.id));

  return u ?? null;
});

/**
 * Require an authenticated user or redirect to /login.
 * Use in Server Components and Route Handlers that must be protected.
 */
export async function requireAuth() {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  return u;
}

/**
 * Require an admin user or redirect to /login.
 */
export async function requireAdmin() {
  const u = await requireAuth();
  if (u.role !== "admin") redirect("/login");
  return u;
}

/**
 * Get the system prompt from the settings table.
 * Returns the default prompt if none has been saved.
 */
export async function getSystemPrompt(): Promise<string> {
  const { settings } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "system_prompt"));

  if (row) return row.value;

  const defaultPrompt = await import("@/lib/agent/prompts").then(
    (m) => m.defaultSystemPrompt
  );
  return defaultPrompt;
}
