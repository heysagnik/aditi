import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Catch-all route handler that delegates every /api/auth/* request
 * to Better Auth (sign-in, sign-out, session, etc.).
 */
export const { GET, POST } = toNextJsHandler(auth);
