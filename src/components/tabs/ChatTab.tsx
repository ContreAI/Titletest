"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText, Loader2 } from "lucide-react";
import { Card, Button } from "@/components/common";
import { Transaction, ChatMessage } from "@/types";
import { mockChatMessages, mockSuggestedQuestions } from "@/data/mockData";

export interface ChatTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

// Mock AI responses for demo
const mockResponses: Record<string, { content: string; source?: { documentName: string; section: string } }> = {
  "what contingencies apply": {
    content: "This transaction has the following contingencies: 1) Inspection contingency (expires Dec 21, 2024), 2) Appraisal contingency (expires Dec 28, 2024), and 3) Loan contingency (expires Jan 5, 2025). All contingencies must be satisfied or waived by their respective deadlines.",
    source: { documentName: "Purchase Agreement", section: "Sections 8-10" },
  },
  "who pays for title insurance": {
    content: "According to the Purchase Agreement, the Seller pays for the Owner's Title Insurance Policy, and the Buyer pays for the Lender's Title Insurance Policy. This is standard practice in Idaho real estate transactions.",
    source: { documentName: "Purchase Agreement", section: "Section 12" },
  },
  "what items are included": {
    content: "The following items are included in the sale: all existing appliances (refrigerator, stove, dishwasher, microwave), window coverings, garage door openers, and all fixtures permanently attached to the property.",
    source: { documentName: "Purchase Agreement", section: "Section 4" },
  },
  "when is the closing date": {
    content: "The closing date is scheduled for January 15, 2025. The signing window is January 13-17, 2025. Please schedule your signing appointment through the Signing tab.",
    source: { documentName: "Purchase Agreement", section: "Section 2" },
  },
  "what is the earnest money amount": {
    content: "The earnest money deposit is $10,000. It was deposited on December 14, 2024 and is being held by Contre Title. The earnest money receipt has been issued and is available in the Documents tab.",
    source: { documentName: "Earnest Money Receipt", section: "Full Document" },
  },
  "what are the loan terms": {
    content: "The transaction involves a Conventional loan with a loan amount of $340,000 (80% LTV). The purchase price is $425,000 with a down payment of $85,000. The loan contingency deadline is January 5, 2025.",
    source: { documentName: "Purchase Agreement", section: "Section 10" },
  },
};

// Find a matching response for the user's question
function findMockResponse(question: string): { content: string; source?: { documentName: string; section: string } } {
  const lowerQuestion = question.toLowerCase();

  for (const [key, response] of Object.entries(mockResponses)) {
    if (lowerQuestion.includes(key)) {
      return response;
    }
  }

  // Default response
  return {
    content: "I can help answer questions about your transaction based on the documents on file. Try asking about contingencies, closing dates, earnest money, loan terms, or what items are included in the sale.",
  };
}

export default function ChatTab({ transaction, side }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      transactionId: transaction.id,
      side,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = findMockResponse(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        transactionId: transaction.id,
        side,
        role: "assistant",
        content: response.content,
        source: response.source,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-320px)] min-h-[500px]">
      {/* Header */}
      <Card className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-spruce/10 text-spruce">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-storm-gray">AI Assistant</h3>
            <p className="text-sm text-river-stone">
              Ask anything about this transaction. Answers sourced from your documents.
            </p>
          </div>
        </div>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 overflow-hidden flex flex-col" padding="none">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-river-stone">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">
                Ask a question or click a suggestion below
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === "user"
                      ? "order-1"
                      : "order-2"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex items-start gap-2 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-full flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-spruce text-white"
                          : "bg-sea-glass/30 text-river-stone"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-spruce text-white rounded-tr-sm"
                          : "bg-mist text-storm-gray rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>

                      {/* Source Citation */}
                      {message.source && (
                        <div
                          className={`flex items-center gap-1 mt-2 pt-2 border-t ${
                            message.role === "user"
                              ? "border-white/20 text-white/70"
                              : "border-border text-river-stone"
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span className="text-xs italic">
                            Source: {message.source.documentName}, {message.source.section}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-full bg-sea-glass/30 text-river-stone">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-mist">
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin text-river-stone" />
                    <span className="text-sm text-river-stone">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        <div className="px-4 py-3 border-t border-divider bg-elevation1/50">
          <p className="text-xs text-river-stone mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {mockSuggestedQuestions.slice(0, 4).map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-3 py-1.5 text-xs font-medium text-spruce bg-paper border border-sea-glass rounded-full hover:bg-spruce/5 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-divider bg-paper">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about this transaction..."
                rows={1}
                className="w-full px-4 py-3 text-sm border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
