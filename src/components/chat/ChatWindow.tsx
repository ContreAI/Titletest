"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText, Loader2, Sparkles } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import type { ChatMessageItem } from "@/stores/chatStore";

type Persona = "title" | "agent" | "client";

interface ChatWindowProps {
  persona: Persona;
  transactionId?: string;
  side?: "buyer" | "seller";
}

// Persona-aware suggested questions
const SUGGESTED_QUESTIONS: Record<Persona, string[]> = {
  title: [
    "Summarize the purchase contract",
    "What lien holders were found?",
    "Has the buyer agent submitted client info?",
    "What automation steps are pending?",
  ],
  agent: [
    "What does my client need to do next?",
    "Summarize the title commitment",
    "Are there any overdue tasks?",
    "What documents are still missing?",
  ],
  client: [
    "What do I need to do next?",
    "Explain the earnest money process",
    "When is my closing date?",
    "What does the title commitment mean?",
  ],
};

// Persona-aware mock responses
const MOCK_RESPONSES: Record<string, { content: string; source?: { documentName: string; section: string } }> = {
  "summarize the purchase contract": {
    content:
      "The purchase agreement is for 1234 Elm Street, Boise ID 83702 at a purchase price of $385,000. Key terms: $8,000 earnest money deposit, conventional financing at ~20% down, inspection contingency expires Jan 31, financing contingency expires Feb 14, and closing is scheduled for Feb 28, 2025. The seller is Jane Doe and buyers are John & Mary Smith.",
    source: { documentName: "Purchase Agreement", section: "Sections 1-12" },
  },
  "what lien holders were found": {
    content:
      "One lien holder was identified in the title commitment: Wells Fargo Bank, N.A. with a first mortgage (Loan #****4567). The approximate payoff balance is $198,500. A payoff demand letter has been automatically sent to Wells Fargo.",
    source: { documentName: "Title Commitment", section: "Schedule B-II" },
  },
  "has the buyer agent submitted client info": {
    content:
      "Yes, Sarah Johnson (buyer's agent) submitted client contact information for John & Mary Smith on Jan 26, 2025. Wire instructions and portal access have been automatically sent to the buyers.",
  },
  "what automation steps are pending": {
    content:
      "Two automation steps are pending: 1) Title Commitment AI Report — will be generated when the title commitment is uploaded. 2) Lien Holder Payoff Requests — will auto-trigger when the title commitment identifies lien holders.",
  },
  "what does my client need to do next": {
    content:
      "Your client's most urgent tasks: 1) Download and review the title commitment (B-09, due Day 5-12). 2) Upload the inspection report (B-10, due Day 7-15). 3) Review seller disclosures (B-11, due Day 5-10). The earnest money tasks are already completed.",
    source: { documentName: "Task Checklist", section: "Phase 2" },
  },
  "summarize the title commitment": {
    content:
      "The title commitment shows clean title with one existing mortgage (Wells Fargo, ~$198,500). Standard exceptions apply including an HOA (Elm Creek HOA) and a 10-foot utility easement. No unusual encumbrances or title defects found. Schedule B-I has 4 standard requirements to satisfy before closing.",
    source: { documentName: "Title Commitment", section: "Schedules A, B-I, B-II" },
  },
  "are there any overdue tasks": {
    content:
      "No tasks are currently overdue. However, 2 tasks require action: B-09 (Download title commitment) and B-10 (Upload inspection report) are in the Inspections & Due Diligence phase and should be completed soon.",
  },
  "what documents are still missing": {
    content:
      "The following documents are still pending: 1) Inspection Report (buyer upload). 2) Title Commitment (from escrow — pending upload). 3) Insurance Binder (buyer upload, due pre-close). 4) Closing Disclosure (from escrow, due 3+ business days before close).",
  },
  "what do i need to do next": {
    content:
      "Your next action is to download and review the title commitment (Task B-09). After that, you'll need to upload your home inspection report (B-10) and review the seller's disclosures (B-11). You can find these tasks in your Tasks tab.",
    source: { documentName: "Task Checklist", section: "Phase 2" },
  },
  "explain the earnest money process": {
    content:
      "Earnest money is a good-faith deposit showing you're serious about buying. Your $8,000 was wired to Premier Title & Escrow's trust account and confirmed received on Jan 27. This money is applied toward your purchase at closing. If the deal falls through due to a covered contingency, you may get it back per the contract terms.",
    source: { documentName: "Earnest Money Receipt", section: "Full Document" },
  },
  "when is my closing date": {
    content:
      "Your closing is scheduled for February 28, 2025. You'll need to complete all remaining tasks before that date, including signing the Closing Disclosure (at least 3 business days before) and wiring your closing funds. Your agent will coordinate the signing appointment.",
    source: { documentName: "Purchase Agreement", section: "Section 2" },
  },
  "what does the title commitment mean": {
    content:
      'The title commitment is like a "promise to insure" from the title company. It shows who owns the property, any debts or liens against it, and any restrictions (like HOA rules or easements). Your title commitment shows clean ownership by the seller with one mortgage that will be paid off at closing. The utility easement and HOA are normal for your neighborhood.',
    source: { documentName: "Title Commitment", section: "Plain-English Summary" },
  },
};

function findMockResponse(question: string): { content: string; source?: { documentName: string; section: string } } {
  const lower = question.toLowerCase();
  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return {
    content:
      "I can help answer questions about your transaction documents. Try asking about the purchase contract, title commitment, earnest money, closing dates, or what tasks need attention.",
  };
}

export default function ChatWindow({
  persona,
  transactionId,
  side,
}: ChatWindowProps) {
  const { isOpen, messages, isLoading, addMessage, setLoading } =
    useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggested = SUGGESTED_QUESTIONS[persona];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessage(userMsg);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const response = findMockResponse(userMsg.content);
      const assistantMsg: ChatMessageItem = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: response.content,
        source: response.source,
        timestamp: new Date().toISOString(),
      };
      addMessage(assistantMsg);
      setLoading(false);
    }, 800 + Math.random() * 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggested = (q: string) => {
    setInput(q);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 w-[400px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-140px)] glass-chat border border-[var(--glass-border)] rounded-2xl shadow-[var(--shadow-5)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--glass-border)] bg-royal/8">
        <div className="p-1.5 rounded-full bg-royal/10">
          <Sparkles className="w-4 h-4 text-royal" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            AI Assistant
          </h3>
          <p className="text-xs text-[var(--text-tertiary)] truncate">
            {persona === "title"
              ? "Ask about any transaction document"
              : persona === "agent"
                ? "Ask about your client's transaction"
                : "Ask about your home purchase"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-10 h-10 mx-auto mb-3 text-[var(--text-disabled)]" />
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
              How can I help?
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              I have context on all documents in your vault.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggested.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggested(q)}
                  className="px-3 py-1.5 text-xs font-medium text-royal bg-royal/5 border border-royal/20 rounded-full hover:bg-royal/10 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start gap-2 max-w-[85%] ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`p-1 rounded-full flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-royal text-white"
                      : "bg-royal/10 text-royal"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>
                <div
                  className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-royal text-white rounded-tr-sm"
                      : "bg-elevation1 text-[var(--text-primary)] rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                  {msg.source && (
                    <div
                      className={`flex items-center gap-1 mt-2 pt-1.5 border-t text-xs ${
                        msg.role === "user"
                          ? "border-white/20 text-white/70"
                          : "border-divider text-[var(--text-tertiary)]"
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span className="italic">
                        {msg.source.documentName}, {msg.source.section}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="p-1 rounded-full bg-royal/10 text-royal">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="px-3 py-2 rounded-xl rounded-tl-sm bg-elevation1">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-tertiary)]" />
                  <span className="text-sm text-[var(--text-tertiary)]">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips (when there are messages) */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-divider bg-elevation1/30">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {suggested.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => handleSuggested(q)}
                className="px-2.5 py-1 text-[11px] font-medium text-royal bg-paper border border-royal/20 rounded-full hover:bg-royal/5 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[var(--glass-border)] bg-transparent">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents..."
            rows={1}
            className="flex-1 px-3 py-2 text-sm border border-divider rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal bg-paper text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
            style={{ minHeight: "40px", maxHeight: "80px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-royal text-white disabled:opacity-40 hover:bg-royal-700 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
