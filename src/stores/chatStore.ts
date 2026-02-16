import { create } from "zustand";

// ============================================
// Chat Store: Manages floating chatbot state
// Messages, open/close, persona context
// ============================================

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: { documentName: string; section: string };
  timestamp: string;
}

interface ChatStoreState {
  isOpen: boolean;
  messages: ChatMessageItem[];
  isLoading: boolean;

  // Actions
  toggle: () => void;
  open: () => void;
  close: () => void;
  addMessage: (message: ChatMessageItem) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),
}));
