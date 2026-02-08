"use client";

import { useState } from "react";
import {
  FileText,
  RefreshCw,
  Download,
  Mail,
  Copy,
  Trash2,
  ExternalLink,
  Upload,
  Check,
  MoreVertical,
  FileSignature,
  DollarSign,
  Shield,
  Home,
  Scale,
} from "lucide-react";
import { Card, Button, Badge, StatusBadge, IconButton } from "@/components/common";
import { Document } from "@/types";
import { formatDate } from "@/data/mockData";

export interface DocumentCardProps {
  document: Document;
  onViewReport?: () => void;
  onViewOriginal?: () => void;
  onReprocess?: () => void;
  onDownload?: () => void;
  onEmail?: () => void;
  onCopyLink?: () => void;
  onDelete?: () => void;
  onPushToSkySlope?: () => void;
  isPushedToSkySlope?: boolean;
  showSkySlopeActions?: boolean;
}

// Document type labels
const documentTypeLabels: Record<string, string> = {
  purchase_agreement: "PURCHASE AGREEMENT",
  addendum: "ADDENDUM",
  earnest_money_receipt: "EM RECEIPT",
  title_commitment: "TITLE COMMITMENT",
  preliminary_title_report: "PRELIM TITLE",
  settlement_statement_buyer: "SETTLEMENT STMT",
  settlement_statement_seller: "SETTLEMENT STMT",
  wire_instructions: "WIRE INSTRUCTIONS",
  closing_disclosure: "CLOSING DISCLOSURE",
  deed: "DEED",
  title_policy: "TITLE POLICY",
  payoff_statement: "PAYOFF STATEMENT",
  inspection_report: "INSPECTION",
  appraisal: "APPRAISAL",
  loan_approval: "LOAN APPROVAL",
  insurance_binder: "INSURANCE BINDER",
  hoa_documents: "HOA DOCS",
  other: "OTHER",
};

// File-type-specific icon and color accent
const DOC_TYPE_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  accentBg: string;
  accentText: string;
}> = {
  purchase_agreement: { icon: FileSignature, accentBg: "bg-spruce/10", accentText: "text-spruce" },
  addendum: { icon: FileSignature, accentBg: "bg-spruce/10", accentText: "text-spruce" },
  earnest_money_receipt: { icon: DollarSign, accentBg: "bg-fern-50", accentText: "text-fern" },
  title_commitment: { icon: Shield, accentBg: "bg-indigo-50", accentText: "text-indigo-500" },
  preliminary_title_report: { icon: Shield, accentBg: "bg-indigo-50", accentText: "text-indigo-500" },
  settlement_statement_buyer: { icon: DollarSign, accentBg: "bg-fern-50", accentText: "text-fern" },
  settlement_statement_seller: { icon: DollarSign, accentBg: "bg-fern-50", accentText: "text-fern" },
  wire_instructions: { icon: DollarSign, accentBg: "bg-amber-50", accentText: "text-amber-600" },
  closing_disclosure: { icon: Scale, accentBg: "bg-amber-50", accentText: "text-amber-600" },
  deed: { icon: Home, accentBg: "bg-spruce/10", accentText: "text-spruce" },
  title_policy: { icon: Shield, accentBg: "bg-indigo-50", accentText: "text-indigo-500" },
  payoff_statement: { icon: DollarSign, accentBg: "bg-signal-red-50", accentText: "text-signal-red" },
  inspection_report: { icon: Home, accentBg: "bg-amber-50", accentText: "text-amber-600" },
  appraisal: { icon: Home, accentBg: "bg-fern-50", accentText: "text-fern" },
  loan_approval: { icon: DollarSign, accentBg: "bg-fern-50", accentText: "text-fern" },
  insurance_binder: { icon: Shield, accentBg: "bg-indigo-50", accentText: "text-indigo-500" },
  hoa_documents: { icon: Home, accentBg: "bg-elevation2", accentText: "text-[var(--text-tertiary)]" },
  other: { icon: FileText, accentBg: "bg-elevation2", accentText: "text-[var(--text-tertiary)]" },
};

export default function DocumentCard({
  document,
  onViewReport,
  onViewOriginal,
  onReprocess,
  onDownload,
  onEmail,
  onCopyLink,
  onDelete,
  onPushToSkySlope,
  isPushedToSkySlope = false,
  showSkySlopeActions = false,
}: DocumentCardProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPending = document.processing.status === "pending";
  const isProcessed = document.processing.status === "processed";
  const isProcessing = document.processing.status === "processing";
  const canDelete =
    document.source === "buyer_upload" || document.source === "seller_upload";
  const canPushToSkySlope = showSkySlopeActions && isProcessed && !isPushedToSkySlope;

  const docConfig = DOC_TYPE_CONFIG[document.type] || DOC_TYPE_CONFIG.other;
  const DocIcon = docConfig.icon;

  // Build menu items for mobile overflow menu
  const menuItems = [
    onViewOriginal && { label: "View Original", icon: <FileText className="w-4 h-4" />, onClick: onViewOriginal },
    onReprocess && isProcessed && { label: "Reprocess", icon: <RefreshCw className="w-4 h-4" />, onClick: onReprocess },
    onDownload && { label: "Download", icon: <Download className="w-4 h-4" />, onClick: onDownload },
    onEmail && { label: "Email", icon: <Mail className="w-4 h-4" />, onClick: onEmail },
    onCopyLink && { label: "Copy Link", icon: <Copy className="w-4 h-4" />, onClick: onCopyLink },
    canPushToSkySlope && { label: "Push to SkySlope", icon: <Upload className="w-4 h-4" />, onClick: onPushToSkySlope },
    canDelete && onDelete && { label: "Delete", icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true },
  ].filter(Boolean) as Array<{ label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }>;

  return (
    <Card hover={isProcessed} className="group">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {/* Type-specific icon with color accent */}
            <div className={`p-2 rounded-lg flex-shrink-0 ${docConfig.accentBg}`}>
              <DocIcon className={`w-5 h-5 ${docConfig.accentText}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-[var(--text-primary)] truncate">
                {document.name}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="default" size="sm">
                  {documentTypeLabels[document.type] || document.type.toUpperCase()}
                </Badge>
                <StatusBadge status={document.processing.status} size="sm" />
                {showSkySlopeActions && isPushedToSkySlope && (
                  <span className="sm:hidden flex items-center gap-1 text-xs text-fern font-medium">
                    <Check className="w-3 h-3" />
                    Synced
                  </span>
                )}
              </div>

              {/* Processing progress bar */}
              {isProcessing && (
                <div className="mt-2 w-full max-w-[200px]">
                  <div className="w-full h-1.5 bg-elevation3 rounded-full overflow-hidden">
                    <div className="h-full bg-spruce rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Processing document...</p>
                </div>
              )}

              {document.uploadedAt && !isProcessing && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Uploaded {formatDate(document.uploadedAt)}
                </p>
              )}
              {isPending && (
                <p className="text-xs text-[var(--text-disabled)] mt-1 italic">
                  Awaiting from Title
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Primary Action - View Report */}
          {document.filePath && (
            <Button
              variant="primary"
              size="sm"
              onClick={onViewReport}
              leftIcon={<ExternalLink className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              View Report
            </Button>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <Button variant="secondary" size="sm" disabled isLoading className="flex-1 sm:flex-none">
              Processing
            </Button>
          )}

          {/* Mobile: Overflow menu */}
          {!isPending && menuItems.length > 0 && (
            <div className="relative sm:hidden">
              <IconButton
                label="More actions"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <MoreVertical className="w-4 h-4" />
              </IconButton>

              {mobileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-paper border border-divider rounded-lg shadow-[var(--shadow-2)] py-1 min-w-[160px]">
                    {menuItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          item.onClick();
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-sm text-left flex items-center gap-3 min-h-[44px] ${
                          item.danger
                            ? "text-signal-red hover:bg-signal-red-50"
                            : "text-[var(--text-primary)] hover:bg-elevation1"
                        } transition-colors`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Desktop: Secondary Actions */}
          {!isPending && (
            <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onViewOriginal && (
                <IconButton label="View Original" onClick={onViewOriginal}>
                  <FileText className="w-4 h-4" />
                </IconButton>
              )}
              {onReprocess && isProcessed && (
                <IconButton label="Reprocess" onClick={onReprocess}>
                  <RefreshCw className="w-4 h-4" />
                </IconButton>
              )}
              {onDownload && (
                <IconButton label="Download" onClick={onDownload}>
                  <Download className="w-4 h-4" />
                </IconButton>
              )}
              {onEmail && (
                <IconButton label="Email" onClick={onEmail}>
                  <Mail className="w-4 h-4" />
                </IconButton>
              )}
              {onCopyLink && (
                <IconButton label="Copy Link" onClick={onCopyLink}>
                  <Copy className="w-4 h-4" />
                </IconButton>
              )}
              {canDelete && onDelete && (
                <IconButton label="Delete" variant="danger" onClick={onDelete}>
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              )}
              {/* SkySlope Push Button */}
              {showSkySlopeActions && (
                <>
                  <div className="h-4 w-px bg-divider mx-1" />
                  {canPushToSkySlope ? (
                    <IconButton
                      label="Push to SkySlope"
                      onClick={onPushToSkySlope}
                    >
                      <Upload className="w-4 h-4" />
                    </IconButton>
                  ) : isPushedToSkySlope ? (
                    <span className="flex items-center gap-1 text-xs text-fern font-medium px-2">
                      <Check className="w-3 h-3" />
                      Synced
                    </span>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
