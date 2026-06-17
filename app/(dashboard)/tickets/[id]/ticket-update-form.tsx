"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updateTicket } from "@/lib/actions";

type Ticket = {
  id: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  assignedAdminId: string | null;
};

type Admin = { id: string; name: string };

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm ";

export function TicketUpdateForm({
  ticket,
  admins,
}: {
  ticket: Ticket;
  admins: Admin[];
}) {
  const [state, action, pending] = useActionState<any, FormData>(updateTicket, {});

  return (
    <form action={action} className="rounded-xl border border-zinc-200 p-4 ">
      <input type="hidden" name="ticketId" value={ticket.id} />
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
          Status
          <select
            name="status"
            defaultValue={ticket.status}
            className={inputClass}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
          Priority
          <select
            name="priority"
            defaultValue={ticket.priority}
            className={inputClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
          Assignee
          <select
            name="assignedAdminId"
            defaultValue={ticket.assignedAdminId ?? ""}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" className="bg-primary text-primary-foreground" size="sm" disabled={pending}>
          Update
        </Button>
      </div>

      {state?.error && (
        <p className="mt-3 text-sm text-red-500">
          {typeof state.error === "string"
            ? state.error
            : "Failed to update ticket."}
        </p>
      )}
    </form>
  );
}
