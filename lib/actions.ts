"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { settings, tickets, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { defaultSystemPrompt } from "@/lib/agent/prompts";

/**
 * Sign out: calls Better Auth's API then redirects to /login.
 */
export async function signOutAction() {
  const h = await headers();
  await auth.api.signOut({
    headers: h,
  });
  redirect("/login");
}

const systemPromptSchema = z.object({
  prompt: z.string().min(1, "System prompt cannot be empty."),
});

/**
 * Save the system prompt to the settings table (upsert).
 */
export async function saveSystemPrompt(formData: FormData) {
  const parsed = systemPromptSchema.safeParse({
    prompt: formData.get("prompt"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.flatten().fieldErrors.prompt?.[0] || "Invalid prompt");
  }

  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "system_prompt"));

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ value: parsed.data.prompt, updatedAt: new Date() })
      .where(eq(settings.key, "system_prompt"));
  } else {
    await db.insert(settings).values({
      key: "system_prompt",
      value: parsed.data.prompt,
    });
  }

  revalidatePath("/knowledge-base");
}

/**
 * Server action helper for client components that need the default prompt.
 */
export async function getDefaultPrompt() {
  return defaultSystemPrompt;
}

// ───────────────────────────────────────────────────────────
//  Ticket updates
// ───────────────────────────────────────────────────────────

const ticketUpdateSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignedAdminId: z.string().nullable().optional(),
});

export async function updateTicket(prevState: any, formData: FormData) {
  const assignedRaw = formData.get("assignedAdminId");
  const parsed = ticketUpdateSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status") || undefined,
    priority: formData.get("priority") || undefined,
    assignedAdminId:
      assignedRaw === null || assignedRaw === ""
        ? null
        : (assignedRaw as string),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { ticketId, ...patch } = parsed.data;
  // Strip undefined keys so we don't overwrite with nulls.
  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  );

  if (Object.keys(cleanPatch).length === 0) {
    return { error: { _form: ["No changes to apply."] } };
  }

  await db
    .update(tickets)
    .set({ ...cleanPatch, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  return { success: true };
}
