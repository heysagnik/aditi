"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active:    { label: "Active",    bg: "#d9f3e1", text: "#1aae39" },
  escalated: { label: "Escalated", bg: "#ffe8d4", text: "#793400" },
  resolved:  { label: "Resolved",  bg: "#f0eeec", text: "#5d5b54" },
};

type RowType = {
  id: string;
  customerName: string | null;
  customerIdentifier: string | null;
  status: string | null;
  updatedAt: Date;
  assigneeName: string | null;
};

export default function ConversationList({ rows }: { rows: RowType[] }) {
  const pathname = usePathname();

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#e5e3df] bg-[#ffffff]">
          <AlertCircle className="h-5 w-5 text-[#5645d4]" />
        </div>
        <div>
          <p className="text-[14px] font-medium text-[#1a1a1a]">
            No conversations yet
          </p>
          <p className="mt-1 text-[13px] leading-[1.50] text-[#787671]">
            Visit <Link href="/chat" className="text-[#5645d4] hover:underline">/chat</Link> to start one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {rows.map((c) => {
        const isActive = pathname === `/conversations/${c.id}`;
        const s = statusConfig[c.status ?? ""] ?? statusConfig.active;
        const displayName = c.customerName ?? c.customerIdentifier ?? "Unknown";
        const initials = displayName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <Link
            key={c.id}
            href={`/conversations/${c.id}`}
            className={`group relative flex flex-col gap-2.5 border-b border-[#e5e3df] px-5 py-4 transition-colors ${
              isActive ? "bg-[#f6f5f4]" : "bg-[#ffffff] hover:bg-[#fafaf9]"
            }`}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-[2px] bg-[#5645d4]" />
            )}
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#e6e0f5] text-[13px] font-semibold text-[#391c57]">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium leading-[1.50] text-[#1a1a1a]">
                    {displayName}
                  </p>
                  <p className="truncate text-[12px] leading-[1.40] text-[#787671]">
                    {new Date(c.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              
              <div className="shrink-0">
                <span
                  className="inline-flex items-center rounded-[6px] px-[8px] py-[2px] text-[13px] font-semibold leading-[1.40]"
                  style={{ backgroundColor: s.bg, color: s.text }}
                >
                  {s.label}
                </span>
              </div>
            </div>

            {c.assigneeName && (
              <div className="pl-11 mt-1">
                <p className="truncate text-[12px] font-medium text-[#787671]">
                  Assigned to: {c.assigneeName}
                </p>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
