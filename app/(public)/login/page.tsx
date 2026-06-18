"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message ?? "Invalid credentials");
      setLoading(false);
      return;
    }
    router.push("/knowledge-base");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#fafaf9] px-4 py-16">
      <div className="w-full max-w-[380px] rounded-[12px] border border-[#e5e3df] bg-[#ffffff] p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-start">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#e5e3df] bg-[#ffffff]">
            <Logo className="h-6 w-6 text-[#1a1a1a]" />
          </div>
          <h1 className="text-[28px] font-semibold leading-[1.20] tracking-[-0.6px] text-[#1a1a1a]">
            Welcome back
          </h1>
          <p className="mt-1 text-[16px] leading-[1.50] text-[#787671]">
            Sign in to your admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium uppercase leading-[1.30] tracking-[0.4px] text-[#787671]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              required
              className="rounded-[8px] border border-[#c8c4be] bg-[#ffffff] px-[12px] py-[8px] text-[16px] leading-[1.50] tracking-[-0.05px] text-[#1a1a1a] outline-none transition-all focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium uppercase leading-[1.30] tracking-[0.4px] text-[#787671]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-[8px] border border-[#c8c4be] bg-[#ffffff] py-[8px] pl-[12px] pr-[40px] text-[16px] leading-[1.50] tracking-[-0.05px] text-[#1a1a1a] outline-none transition-all focus:border-[#5645d4] focus:ring-1 focus:ring-[#5645d4]"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a4a097] transition-colors hover:text-[#1a1a1a]"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-[8px] border border-[#e03131]/25 bg-[#fef2f2] px-3 py-2.5 text-[14px] text-[#e03131]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group mt-1 flex w-full items-center justify-center gap-2 rounded-[8px] px-[14px] py-[8px] text-[14px] font-medium leading-[1.20] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 enabled:bg-[#5645d4] enabled:hover:bg-[#4534b3]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] leading-[1.40] text-[#a4a097]">
          Need help?{" "}
          <a
            href="/chat"
            className="text-[#5645d4] transition-colors hover:text-[#4534b3]"
          >
            Talk to Aditi
          </a>
        </p>
      </div>
    </div>
  );
}
