import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e5e3df] bg-white/80 px-4 backdrop-blur-md sm:h-16 sm:px-6">
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-5 w-5 text-[#1a1a1a] sm:h-6 sm:w-6" />
            <span className="text-[14px] font-semibold tracking-[-0.3px] text-[#1a1a1a] sm:text-[15px]">
              Aditi
            </span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {["Product", "Solutions", "Pricing"].map((item) => (
              <span
                key={item}
                className="text-[14px] font-medium text-[#5d5b54] transition-colors hover:text-[#1a1a1a]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-[8px] px-3 py-1.5 text-[13px] font-medium text-[#5d5b54] transition-colors hover:text-[#1a1a1a] sm:px-3.5 sm:py-2 sm:text-[14px]"
          >
            Log in
          </Link>
          <Link
            href="/chat"
            className="rounded-[8px] bg-[#5645d4] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#4534b3] sm:px-4 sm:py-2 sm:text-[14px]"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-white px-4 text-center sm:px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-[18%] h-4 w-4 rounded-[3px] bg-[#ff64c8] opacity-50 rotate-12" />
          <div className="absolute left-[15%] top-[55%] h-3 w-3 rounded-[2px] bg-[#dd5b00] opacity-40 -rotate-6" />
          <div className="absolute right-[10%] top-[15%] h-5 w-5 rounded-[3px] bg-[#7b3ff2] opacity-40 -rotate-12" />
          <div className="absolute right-[18%] top-[60%] h-3.5 w-3.5 rounded-[2px] bg-[#2a9d99] opacity-35 rotate-30" />
          <div className="absolute left-[35%] top-[8%] h-2.5 w-2.5 rounded-[2px] bg-[#f5d75e] opacity-45 rotate-45" />
          <div className="absolute right-[35%] bottom-[12%] h-3 w-3 rounded-[2px] bg-[#1aae39] opacity-30" />
        </div>

        <div className="relative mx-auto max-w-3xl pt-[60px] pb-[60px] sm:pt-[80px] sm:pb-[80px] md:pt-[120px] md:pb-[100px]">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f6f5f4] px-3 py-1 text-[11px] font-medium text-[#5d5b54] sm:px-3.5 sm:text-[12px]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1aae39] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1aae39]" />
            </span>
            AI-Powered Customer Support
          </p>

          <h1 className="text-[36px] font-semibold leading-[1.05] tracking-[-2px] text-[#1a1a1a] sm:text-[48px] md:text-[64px] lg:text-[80px]">
            Support that
            <br />
            never sleeps.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.50] text-[#5d5b54] sm:mt-5 sm:text-[18px]">
            Aditi resolves issues instantly, escalates complex problems to your team, and remembers every conversation.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <Link
              href="/chat"
              className="rounded-[8px] bg-[#5645d4] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#4534b3]"
            >
              Get Aditi free
            </Link>
            <Link
              href="/login"
              className="rounded-[8px] border border-[#c8c4be] px-5 py-2.5 text-[14px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f6f5f4]"
            >
              Request a demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-[#e5e3df] bg-[#f6f5f4] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          {[
            { value: "<2s", label: "Average response" },
            { value: "85%", label: "Auto-resolved" },
            { value: "24/7", label: "Always available" },
            { value: "∞", label: "Conversations" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[28px] font-semibold tracking-[-1px] text-[#1a1a1a] sm:text-[32px]">
                {stat.value}
              </p>
              <p className="mt-1 text-[13px] text-[#787671] sm:text-[14px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature section — Keep work moving 24/7 */}
      <section className="px-4 py-[64px] sm:px-6 sm:py-[80px] md:py-[96px]">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[1px] text-[#5645d4] sm:text-[12px]">
            How it works
          </p>
          <h2 className="mt-3 text-center text-[28px] font-semibold leading-[1.20] tracking-[-0.5px] text-[#1a1a1a] sm:text-[36px]">
            Keep work moving 24/7
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-[15px] leading-[1.55] text-[#5d5b54] sm:text-[16px]">
            Aditi handles the routine so your team focuses on what matters.
          </p>

          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-[12px] border border-[#e5e3df] bg-[#ffe8d4] p-6 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#dd5b00] text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold leading-[1.25] text-[#37352f] sm:text-[22px]">
                Auto-resolve
              </h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#5d5b54]">
                Instant answers for refunds, order lookups, and FAQs. No human needed.
              </p>
            </div>

            <div className="rounded-[12px] border border-[#e5e3df] bg-[#fde0ec] p-6 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#ff64c8] text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold leading-[1.25] text-[#37352f] sm:text-[22px]">
                Smart escalation
              </h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#5d5b54]">
                Complex issues become tickets auto-assigned to the least-busy admin.
              </p>
            </div>

            <div className="rounded-[12px] border border-[#e5e3df] bg-[#d9f3e1] p-6 sm:p-8 sm:col-span-2 md:col-span-1">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1aae39] text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold leading-[1.25] text-[#37352f] sm:text-[22px]">
                Full memory
              </h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#5d5b54]">
                Every conversation is remembered. No customer repeats themselves twice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ask your on-demand assistant */}
      <section className="px-4 py-[64px] sm:px-6 sm:py-[80px] md:py-[96px]">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-[12px] border border-[#e5e3df] bg-[#f9e79f] p-8 text-center sm:p-12">
            <h2 className="text-[28px] font-semibold leading-[1.20] tracking-[-0.5px] text-[#37352f] sm:text-[36px]">
              Ask your on-demand assistant
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-[1.55] text-[#523410] sm:text-[16px]">
              Aditi learns from every interaction. The more your customers chat, the smarter she gets.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-[12px] border border-[#e5e3df] bg-[#e6e0f5] p-6 sm:p-8">
              <h3 className="text-[16px] font-semibold text-[#391c57] sm:text-[18px]">Tool use</h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#391c57]/80">
                Calls APIs, looks up orders, and processes refunds — all automatically.
              </p>
            </div>
            <div className="rounded-[12px] border border-[#e5e3df] bg-[#dcecfa] p-6 sm:p-8">
              <h3 className="text-[16px] font-semibold text-[#005bab] sm:text-[18px]">Context-aware</h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#005bab]/80">
                Remembers the full conversation and references prior interactions naturally.
              </p>
            </div>
            <div className="rounded-[12px] border border-[#e5e3df] bg-[#fef7d6] p-6 sm:p-8 sm:col-span-2 md:col-span-1">
              <h3 className="text-[16px] font-semibold text-[#793400] sm:text-[18px]">Human handoff</h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#793400]/80">
                Knows when to stop and escalate. Creates tickets and assigns them instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bring it all together */}
      <section className="px-4 py-[64px] sm:px-6 sm:py-[80px] md:py-[96px]">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[1px] text-[#5645d4] sm:text-[12px]">
            Built for support teams
          </p>
          <h2 className="mt-3 text-center text-[28px] font-semibold leading-[1.20] tracking-[-0.5px] text-[#1a1a1a] sm:text-[36px]">
            Bring all your support together
          </h2>

          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-[12px] border border-[#e5e3df] bg-white p-6 sm:p-8">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f6f5f4]">
                <svg className="h-5 w-5 text-[#5645d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold text-[#1a1a1a] sm:text-[22px]">Ticket management</h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#5d5b54]">
                Track, assign, and resolve support tickets with full conversation context.
              </p>
            </div>

            <div className="rounded-[12px] border border-[#e5e3df] bg-white p-6 sm:p-8">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f6f5f4]">
                <svg className="h-5 w-5 text-[#dd5b00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold text-[#1a1a1a] sm:text-[22px]">Knowledge base</h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#5d5b54]">
                Customize Aditi&apos;s behavior with a custom system prompt. She follows your rules.
              </p>
            </div>

            <div className="rounded-[12px] border border-[#e5e3df] bg-white p-6 sm:p-8 sm:col-span-2 md:col-span-1">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f6f5f4]">
                <svg className="h-5 w-5 text-[#1aae39]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-[20px] font-semibold text-[#1a1a1a] sm:text-[22px]">Full visibility</h3>
              <p className="mt-2 text-[14px] leading-[1.50] text-[#5d5b54]">
                See every conversation, track response times, and monitor agent performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-4 py-[64px] sm:px-6 sm:py-[80px] md:py-[96px]">
        <div className="mx-auto max-w-3xl rounded-[12px] bg-[#f6f5f4] px-6 py-10 text-center sm:px-12 sm:py-16">
          <h2 className="text-[28px] font-semibold leading-[1.20] tracking-[-0.5px] text-[#1a1a1a] sm:text-[36px]">
            Ready to transform support?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.55] text-[#5d5b54] sm:text-[16px]">
            Deploy Aditi in minutes. No credit card required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <Link
              href="/chat"
              className="rounded-[8px] bg-[#5645d4] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#4534b3] sm:px-6 sm:py-3"
            >
              Start chatting now
            </Link>
            <Link
              href="/login"
              className="rounded-[8px] border border-[#c8c4be] px-5 py-2.5 text-[14px] font-medium text-[#1a1a1a] transition-colors hover:bg-white sm:px-6 sm:py-3"
            >
              View admin dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e3df] bg-white px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Logo className="h-5 w-5 text-[#1a1a1a]" />
              <span className="text-[14px] font-semibold text-[#1a1a1a]">Aditi</span>
            </div>
            <p className="mt-3 text-[13px] leading-[1.50] text-[#787671]">
              AI-powered customer support platform.
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[#1a1a1a]">Product</h4>
            <ul className="mt-3 space-y-2">
              {["Features", "Pricing", "Changelog"].map((item) => (
                <li key={item}>
                  <span className="text-[13px] text-[#787671] transition-colors hover:text-[#1a1a1a]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[#1a1a1a]">Resources</h4>
            <ul className="mt-3 space-y-2">
              {["Documentation", "API Reference", "Status"].map((item) => (
                <li key={item}>
                  <span className="text-[13px] text-[#787671] transition-colors hover:text-[#1a1a1a]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[#1a1a1a]">Company</h4>
            <ul className="mt-3 space-y-2">
              {["About", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <span className="text-[13px] text-[#787671] transition-colors hover:text-[#1a1a1a]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-5xl border-t border-[#e5e3df] pt-6 text-center">
          <p className="text-[12px] text-[#a4a097]">
            &copy; 2026 Aditi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
