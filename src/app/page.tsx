"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  UserCircle,
  Users,
  ArrowRight,
  Upload,
  FileText,
  Zap,
} from "lucide-react";
import { mockTitleCompany, mockTransaction } from "@/data/mockData";
import { AmbientBackground } from "@/components/layout";

export default function Home() {
  const titleCompany = mockTitleCompany;
  const transaction = mockTransaction;
  const fullAddress = `${transaction.property.address}, ${transaction.property.city}, ${transaction.property.state} ${transaction.property.zip}`;

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative">
      <AmbientBackground persona="landing" />
      {/* Header */}
      <header className="glass-nav py-4 px-6 relative z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-center">
          <Image
            src={titleCompany.logo}
            alt={titleCompany.name}
            width={140}
            height={48}
            className="h-10 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-3xl">
          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
              Kootenai Title Portal
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Automation-driven real estate transaction management
            </p>
          </div>

          {/* Three Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Title Company */}
            <div className="h-full glass rounded-xl border border-[var(--glass-border)] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-royal/10 text-royal mb-4">
                  <Building2 className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  Title Company
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Upload contracts, trigger automations, monitor transactions
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mb-4">
                  <span className="flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Automate
                  </span>
                </div>
                <Link
                  href="/title"
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-royal hover:bg-royal/90 rounded-lg py-2.5 px-4 transition-colors shadow-sm"
                >
                  Open Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Agent Portal */}
            <div className="h-full glass rounded-xl border border-[var(--glass-border)] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-sea-glass/20 text-sea-glass-400 mb-4">
                  <UserCircle className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  Agent Portal
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Manage your side, onboard clients, track tasks & documents
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> Onboard
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Documents
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Link
                    href={`/tx/${transaction.id}/agent/buyer`}
                    className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-royal hover:bg-royal/90 rounded-lg py-2.5 px-3 transition-colors shadow-sm"
                  >
                    Buyer&apos;s Agent
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/tx/${transaction.id}/agent/seller`}
                    className="flex items-center justify-center gap-1.5 text-sm font-semibold text-royal bg-royal/10 hover:bg-royal/20 border border-royal/20 rounded-lg py-2.5 px-3 transition-colors"
                  >
                    Seller&apos;s Agent
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Client Portal */}
            <div className="h-full glass rounded-xl border border-[var(--glass-border)] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-fern/10 text-fern mb-4">
                  <Users className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  Client Portal
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Complete tasks, access wire instructions, track closing
                  progress
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mb-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Self-serve
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Link
                    href={`/tx/${transaction.id}/buyer/login`}
                    className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-fern hover:bg-fern/90 rounded-lg py-2.5 px-3 transition-colors shadow-sm"
                  >
                    Buyer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/tx/${transaction.id}/seller/login`}
                    className="flex items-center justify-center gap-1.5 text-sm font-semibold text-fern bg-fern/10 hover:bg-fern/20 border border-fern/20 rounded-lg py-2.5 px-3 transition-colors"
                  >
                    Seller
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Transaction Info */}
          <div className="glass-subtle border border-[var(--glass-border-subtle)] rounded-xl p-4 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Demo Transaction:{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {fullAddress}
              </span>{" "}
              &middot;{" "}
              <span className="font-[family-name:var(--font-mono)] text-xs">
                {transaction.id}
              </span>
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              All portals show the same demo transaction from different
              perspectives. Client portals accept any password.
            </p>
          </div>

          {/* Footer */}
          <p className="text-xs text-[var(--text-disabled)] text-center mt-6">
            Powered by {titleCompany.name}
          </p>
        </div>
      </main>
    </div>
  );
}
