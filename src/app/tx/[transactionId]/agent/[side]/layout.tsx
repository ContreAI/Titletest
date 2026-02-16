"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/common";
import { mockTitleCompany, mockTransaction } from "@/data/mockData";
import { ChatProvider } from "@/components/chat";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const side = params.side as "buyer" | "seller";
  const transactionId = params.transactionId as string;

  const agentName =
    side === "buyer" ? "Sarah Johnson" : "Mike Williams";
  const brokerage =
    side === "buyer" ? "Premier Boise Realty" : "Idaho Realty Group";

  return (
    <div className="min-h-screen bg-mist flex flex-col">
      {/* Agent Header */}
      <header className="bg-paper border-b border-divider px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={mockTitleCompany.logo}
            alt={mockTitleCompany.name}
            width={100}
            height={32}
            className="h-7 w-auto"
          />
          <div className="w-px h-6 bg-divider" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {agentName}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">{brokerage}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[var(--text-tertiary)]">
              {mockTransaction.property.address}
            </p>
            <p className="text-xs text-[var(--text-disabled)]">
              {side === "buyer" ? "Buyer" : "Seller"}'s Agent Portal
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <ChatProvider persona="agent" transactionId={transactionId} side={side}>
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </ChatProvider>
    </div>
  );
}
