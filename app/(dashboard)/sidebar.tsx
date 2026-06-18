"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions";
import { BookOpen, Ticket, MessageSquare, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";

const navItems = [
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/tickets",        label: "Tickets",        icon: Ticket },
  { href: "/conversations",  label: "Conversations",  icon: MessageSquare },
];

export function Sidebar({ admin }: { admin: any }) {
  const pathname = usePathname();

  const initials =
    admin.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "A";

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-[#e5e3df] bg-[#ffffff]">
      <div className="flex h-14 items-center gap-2.5 border-b border-[#e5e3df] px-4">
        <Logo className="h-6 w-6 text-[#1a1a1a]" />
        <span className="text-[15px] font-semibold tracking-[-0.4px] text-[#1a1a1a]">
          Aditi
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-2.5 rounded-[6px] px-2.5 py-2 transition-colors ${
                isActive ? "bg-[#f6f5f4] text-[#1a1a1a]" : "text-[#787671] hover:bg-[#fafaf9]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-[2px] bg-[#5645d4]" />
              )}
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1a1a1a]" : "text-[#bbb8b1]"}`} />
              <span className={`text-[14px] leading-[1.50] ${isActive ? "font-medium" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="mx-2 mb-3 rounded-[8px] bg-[#f6f5f4] border border-[#e5e3df] p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5645d4] text-[11px] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-[1.30] text-[#1a1a1a]">
              {admin.name}
            </p>
            <p className="truncate text-[12px] leading-[1.40] text-[#787671]">
              {admin.email}
            </p>
          </div>
        </div>

        <form action={signOutAction} className="mt-2">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-[13px] text-[#787671] transition-colors hover:bg-[#e5e3df] hover:text-[#1a1a1a]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}