"use client";

import { useActionState } from "react";
import { updateTicket } from "@/lib/actions";
import { CheckCircle, AlertCircle } from "lucide-react";

type Ticket = {
  id: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  assignedAdminId: string | null;
};

type Admin = { id: string; name: string };

export function TicketUpdateForm({
  ticket,
  admins,
}: {
  ticket: Ticket;
  admins: Admin[];
}) {
  const [state, action, pending] = useActionState<any, FormData>(updateTicket, {});

  return (
    <form action={action} className="rounded-[12px] border border-[#e5e3df] bg-[#f6f5f4] p-6">
      <input type="hidden" name="ticketId" value={ticket.id} />

      <p className="mb-4 text-[13px] font-medium uppercase leading-[1.30] tracking-[0.4px] text-[#787671]">
        Update Ticket
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium uppercase leading-[1.30] tracking-[0.4px] text-[#787671]">
            Status
          </span>
          <select
            name="status"
            defaultValue={ticket.status}
            className="rounded-[8px] border border-[#c8c4be] bg-[#ffffff] p-[8px_28px_8px_12px] text-[14px] leading-[1.50] text-[#1a1a1a] outline-none transition-all focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium uppercase leading-[1.30] tracking-[0.4px] text-[#787671]">
            Priority
          </span>
          <select
            name="priority"
            defaultValue={ticket.priority}
            className="rounded-[8px] border border-[#c8c4be] bg-[#ffffff] p-[8px_28px_8px_12px] text-[14px] leading-[1.50] text-[#1a1a1a] outline-none transition-all focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium uppercase leading-[1.30] tracking-[0.4px] text-[#787671]">
            Assignee
          </span>
          <select
            name="assignedAdminId"
            defaultValue={ticket.assignedAdminId ?? ""}
            className="rounded-[8px] border border-[#c8c4be] bg-[#ffffff] p-[8px_28px_8px_12px] text-[14px] leading-[1.50] text-[#1a1a1a] outline-none transition-all focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
          >
            <option value="">Unassigned</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-[8px] px-[18px] py-[10px] text-[14px] font-medium leading-[1.30] transition-colors disabled:cursor-not-allowed disabled:bg-[#f6f5f4] disabled:text-[#787671] enabled:bg-[#5645d4] enabled:text-white enabled:hover:bg-[#4534b3]"
        >
          {pending ? "Saving…" : "Update"}
        </button>
      </div>

      {state?.success && (
        <div className="mt-5 flex items-center gap-2 rounded-[8px] border border-[#e5e3df] bg-[#f6f5f4] px-4 py-3 text-[14px] leading-[1.50] text-[#1aae39]">
          <CheckCircle className="h-4 w-4" />
          Ticket updated successfully.
        </div>
      )}

      {state?.error && (
        <div className="mt-5 flex items-center gap-2 rounded-[8px] border border-[#e03131]/25 bg-[#fef2f2] px-4 py-3 text-[14px] leading-[1.50] text-[#e03131]">
          <AlertCircle className="h-4 w-4" />
          {typeof state.error === "string" ? state.error : "Failed to update ticket."}
        </div>
      )}
    </form>
  );
}
