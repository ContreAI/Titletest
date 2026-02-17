"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Upload, List, Home } from "lucide-react";
import { mockTitleCompany } from "@/data/mockData";
import { ChatProvider } from "@/components/chat";
import { AmbientBackground } from "@/components/layout";

const NAV_ITEMS = [
  { href: "/title", label: "Dashboard", icon: Home },
  { href: "/title/upload", label: "New Transaction", icon: Upload },
  { href: "/title/transactions", label: "Transactions", icon: List },
];

export default function TitleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative">
      <AmbientBackground persona="title" />
      {/* Top Header */}
      <header className="glass-nav px-6 py-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <Link href="/title" className="flex items-center gap-3">
            <Image
              src={mockTitleCompany.logo}
              alt={mockTitleCompany.name}
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:inline">
              Escrow Portal
            </span>
          </Link>

          <nav className="flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/title"
                  ? pathname === "/title"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-royal/10 text-royal"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevation1)]"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-royal/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-royal">ED</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <ChatProvider persona="title">
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">{children}</main>
      </ChatProvider>
    </div>
  );
}
