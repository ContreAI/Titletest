"use client";

import ChatFloatingButton from "./ChatFloatingButton";
import ChatWindow from "./ChatWindow";

interface ChatProviderProps {
  persona: "title" | "agent" | "client";
  transactionId?: string;
  side?: "buyer" | "seller";
  children: React.ReactNode;
}

export default function ChatProvider({
  persona,
  transactionId,
  side,
  children,
}: ChatProviderProps) {
  return (
    <>
      {children}
      <ChatWindow
        persona={persona}
        transactionId={transactionId}
        side={side}
      />
      <ChatFloatingButton />
    </>
  );
}
