import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { tickets, conversations, user } from "@/lib/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";

// ───────────────────────────────────────────────────────────
//  refund_lookup  —  mock tool to prove the resolve path
// ───────────────────────────────────────────────────────────

export const refundLookup = tool({
  description:
    "Look up an order by ID and process a refund. Returns the order status and refund details.",
  parameters: z.object({
    orderId: z.string().describe("The order ID to look up (e.g. 'ORD-12345')"),
  }),
  // @ts-ignore
  execute: async ({ orderId }) => {
    // Mock implementation — in production this would call an orders service.
    const refundAmount = Math.floor(Math.random() * 200 + 10);
    const resolvedOrderId = orderId || "Unknown Order";
    return {
      orderId: resolvedOrderId,
      status: "refunded",
      refundAmount: `$${refundAmount}.00`,
      message: `Order ${resolvedOrderId} has been refunded $${refundAmount}.00. The refund will appear within 3-5 business days.`,
    };
  },
});

// ───────────────────────────────────────────────────────────
//  escalate_to_ticket  —  create ticket, auto-assign admin
// ───────────────────────────────────────────────────────────

export const getAditiTools = (conversationId: string) => ({
  refund_lookup: refundLookup,
  escalate_to_ticket: tool({
    description:
      "Create a support ticket and auto-assign it to the admin with the fewest open tickets. Use this for complex issues that need human attention.",
    parameters: z.object({
      summary: z
        .string()
        .describe("A concise summary of the customer's issue"),
      priority: z
        .enum(["low", "medium", "high"])
        .describe("The urgency of the issue"),
      title: z
        .string()
        .describe("A short title for the ticket (max 120 chars)"),
    }),
    // @ts-ignore
    execute: async ({ summary, priority, title }) => {
      // Find the admin with the fewest open tickets
      const [leastBusy] = await db
        .select({
          adminId: tickets.assignedAdminId,
          ticketCount: count(),
        })
        .from(tickets)
        .where(eq(tickets.status, "open"))
        .groupBy(tickets.assignedAdminId)
        .orderBy(sql`count(*) asc`)
        .limit(1);

      // If no admin has open tickets yet, pick the first admin
      let assignedAdminId = leastBusy?.adminId;
      if (!assignedAdminId) {
        const [firstAdmin] = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.role, "admin"))
          .limit(1);
        assignedAdminId = firstAdmin?.id;
      }

      const ticketId = randomUUID();

      await db.insert(tickets).values({
        id: ticketId,
        title: title || "Customer Escalation",
        status: "open",
        priority: priority || "medium",
        conversationId,
        assignedAdminId: assignedAdminId ?? null,
        summary: summary || "Escalated to human review.",
      });

      // Mark the conversation as escalated
      await db
        .update(conversations)
        .set({
          status: "escalated",
          ticketId,
          assignedAdminId: assignedAdminId ?? null,
        })
        .where(eq(conversations.id, conversationId));

      return {
        ticketId,
        title,
        priority,
        assignedAdminId,
        message: `Support ticket ${ticketId} has been created and assigned to an admin. A human will follow up shortly.`,
      };
    },
  }),
});
