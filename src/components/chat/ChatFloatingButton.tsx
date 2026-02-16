"use client";

import { MessageCircle, X } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";

export default function ChatFloatingButton() {
  const { isOpen, toggle } = useChatStore();

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[var(--shadow-4)] transition-all duration-200 hover:scale-105 active:scale-95 ${
        isOpen
          ? "bg-[var(--text-primary)] text-paper"
          : "bg-spruce text-white"
      }`}
      aria-label={isOpen ? "Close chat" : "Open AI assistant"}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
    </button>
  );
}
