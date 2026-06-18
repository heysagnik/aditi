import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Inter — closest free substitute for Linear Display + Linear Text */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* JetBrains Mono — closest free substitute for Linear Mono */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Aditi", template: "%s — Aditi" },
  description:
    "Aditi — AI-powered customer support platform. Intelligent triage, seamless escalation, real-time conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full dark`}
    >
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ background: "var(--canvas)", color: "var(--ink)" }}
      >
        {children}
      </body>
    </html>
  );
}
