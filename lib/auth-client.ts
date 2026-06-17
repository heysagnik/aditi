import { createAuthClient } from "better-auth/react";

/**
 * Client-side Better Auth hooks.
 *
 * Usage in Client Components:
 *   import { useSession, signIn, signOut } from "@/lib/auth-client";
 */
export const authClient = createAuthClient();

export const { signIn, signOut, signUp } = authClient;
export const useSession = authClient.useSession;
