"use client";

import Image from "next/image";
import { Settings, HelpCircle, LogOut, Calendar } from "lucide-react";
import { IconButton, ThemeToggle, StatusBadge, Badge } from "@/components/common";
import { Transaction } from "@/types";
import { formatDate, calculateDaysRemaining } from "@/data/mockData";

export interface HeaderProps {
  logo: string;
  companyName: string;
  propertyAddress?: string;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onLogoutClick?: () => void;
  /** Transaction data for consolidated header (optional — used in portal pages) */
  transaction?: Transaction;
  side?: "buyer" | "seller";
}

export default function Header({
  logo,
  companyName,
  propertyAddress,
  onSettingsClick,
  onHelpClick,
  onLogoutClick,
  transaction,
  side,
}: HeaderProps) {
  const hasTransaction = !!transaction;
  const daysUntilClosing = transaction
    ? calculateDaysRemaining(transaction.dates.closingDate)
    : null;
  const roleLabel = side === "buyer" ? "Buyer Agent" : side === "seller" ? "Seller Agent" : null;

  return (
    <header className="sticky top-0 z-30 bg-paper border-b border-divider">
      {/* Row 1: Logo + Actions */}
      <div className="h-14 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-auto">
            <Image
              src={logo}
              alt={`${companyName} logo`}
              width={120}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Center: Property Address (non-transaction pages) */}
        {propertyAddress && !hasTransaction && (
          <div className="hidden md:flex flex-1 justify-center">
            <span className="text-sm font-medium text-[var(--text-tertiary)] truncate max-w-md">
              {propertyAddress}
            </span>
          </div>
        )}

        {/* Center: Transaction info (transaction pages — desktop) */}
        {hasTransaction && (
          <div className="hidden md:flex flex-1 items-center justify-center gap-4">
            <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-sm">
              {transaction.property.address}, {transaction.property.city} {transaction.property.state}
            </span>
            <div className="flex items-center gap-2">
              {roleLabel && <Badge variant="default" size="sm">{roleLabel}</Badge>}
              <StatusBadge status={transaction.status} size="sm" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {/* Closing countdown chip */}
          {hasTransaction && daysUntilClosing !== null && (
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full mr-2 text-xs font-semibold ${
              daysUntilClosing <= 7
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-elevation1 text-[var(--text-secondary)] border border-divider'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-[family-name:var(--font-mono)]">{daysUntilClosing}d</span>
              <span className="text-[var(--text-tertiary)] font-normal">to close</span>
            </div>
          )}

          <ThemeToggle />
          <IconButton label="Settings" variant="ghost" onClick={onSettingsClick}>
            <Settings className="w-5 h-5" />
          </IconButton>
          <IconButton label="Help" variant="ghost" onClick={onHelpClick}>
            <HelpCircle className="w-5 h-5" />
          </IconButton>
          {onLogoutClick && (
            <IconButton label="Sign Out" variant="ghost" onClick={onLogoutClick}>
              <LogOut className="w-5 h-5" />
            </IconButton>
          )}
        </div>
      </div>

      {/* Row 2: Transaction details bar (mobile + desktop sub-row) */}
      {hasTransaction && (
        <div className="px-4 md:px-6 py-2 bg-elevation1 border-t border-divider flex items-center justify-between gap-3">
          {/* Mobile: show address */}
          <div className="md:hidden flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {transaction.property.address}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {roleLabel && <Badge variant="default" size="sm">{roleLabel}</Badge>}
              <StatusBadge status={transaction.status} size="sm" />
            </div>
          </div>

          {/* Desktop: Closing date + Order ID */}
          <div className="hidden md:flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Closing: {formatDate(transaction.dates.closingDate)}</span>
              <span className="font-[family-name:var(--font-mono)] text-[var(--text-secondary)] font-medium">
                ({daysUntilClosing} days)
              </span>
            </div>
            <span className="w-px h-3 bg-divider" />
            <span>
              Order #{" "}
              <span className="font-[family-name:var(--font-mono)]">{transaction.qualiaOrderId || transaction.id}</span>
            </span>
          </div>

          {/* Mobile: countdown */}
          {daysUntilClosing !== null && (
            <div className={`md:hidden flex items-center gap-1 text-xs font-semibold ${
              daysUntilClosing <= 7 ? 'text-amber-600' : 'text-[var(--text-secondary)]'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-[family-name:var(--font-mono)]">{daysUntilClosing}d</span>
            </div>
          )}
        </div>
      )}

      {/* Non-transaction mobile address fallback */}
      {propertyAddress && !hasTransaction && (
        <div className="md:hidden px-4 py-2 bg-elevation1 border-t border-divider">
          <span className="text-sm font-medium text-[var(--text-tertiary)] truncate block">
            {propertyAddress}
          </span>
        </div>
      )}
    </header>
  );
}
