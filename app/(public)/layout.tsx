import { LiveChatWidget } from "@/components/live-chat-widget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <LiveChatWidget />
    </>
  );
}
