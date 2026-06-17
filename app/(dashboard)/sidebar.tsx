"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions";
import { BookOpen, Ticket, MessageSquare, LogOut, BotMessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
];

export function Sidebar({ admin }: { admin: any }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-zinc-50/50 px-4 py-6 backdrop-blur-xl">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
          <BotMessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900">Aditi</h1>
          <p className="text-xs font-medium text-zinc-500">Support Platform</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-white text-primary shadow-sm ring-1 ring-zinc-200"
                  : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-colors ${
                  isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-600"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-zinc-200 pt-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9 border border-zinc-200">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {admin.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <p className="truncate text-sm font-semibold text-zinc-900">{admin.name}</p>
            <p className="truncate text-xs font-medium text-zinc-500">{admin.email}</p>
          </div>
        </div>
        <form action={signOutAction} className="mt-1">
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-red-500" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}