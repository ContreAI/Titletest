"use client";

import { useMemo } from "react";
import {
  Download,
  Mail,
  Printer,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Zap,
} from "lucide-react";
import { Modal, Button, Badge } from "@/components/common";
import { Document } from "@/types";
import type { ReportFinding, FindingSeverity } from "@/types/automation";
import { getMockReport } from "@/lib/mockReportData";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  persona?: "title" | "agent" | "client";
}

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { icon: typeof Info; color: string; bg: string; label: string }
> = {
  info: {
    icon: Info,
    color: "text-spruce",
    bg: "bg-spruce/10",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Attention",
  },
  critical: {
    icon: AlertCircle,
    color: "text-signal-red",
    bg: "bg-signal-red-50",
    label: "Critical",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  financial: "Financial",
  legal: "Legal",
  timeline: "Timeline",
  party: "Parties",
  property: "Property",
  risk: "Risk",
};

function FindingCard({ finding }: { finding: ReportFinding }) {
  const config = SEVERITY_CONFIG[finding.severity];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border border-divider p-3 ${config.bg}/30`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {finding.title}
            </span>
            <Badge variant="default" size="sm">
              {CATEGORY_LABELS[finding.category] || finding.category}
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {finding.detail}
          </p>
          {finding.sourceSection && (
            <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">
              Source: {finding.sourceSection}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportModal({
  isOpen,
  onClose,
  document,
  persona = "agent",
}: ReportModalProps) {
  if (!document) return null;

  const report = useMemo(
    () => getMockReport(document.id, document.type),
    [document.id, document.type]
  );

  if (!report) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Report: ${document.name}`}
        size="full"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-[var(--text-disabled)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Report Not Available
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">
            An AI report for this document type is not yet available. Reports
            are generated automatically when supported document types are
            uploaded.
          </p>
        </div>
      </Modal>
    );
  }

  const warnings = report.keyFindings.filter((f) => f.severity === "warning");
  const critical = report.keyFindings.filter((f) => f.severity === "critical");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`AI Report: ${document.name}`}
      size="full"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Email Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print
            </Button>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="min-h-[400px] space-y-6">
        {/* AI Summary Hero */}
        <div className="bg-spruce/5 border border-spruce/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-spruce/10">
              <Sparkles className="w-5 h-5 text-spruce" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                AI Summary
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {report.summary}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Confidence: {Math.round(report.metadata.confidenceScore * 100)}%
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Processed in {(report.metadata.processingTimeMs / 1000).toFixed(1)}s
                </span>
                <span>Model: {report.metadata.modelVersion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Banner (if warnings/critical) */}
        {(warnings.length > 0 || critical.length > 0) && (
          <div
            className={`rounded-lg p-4 flex items-start gap-3 ${
              critical.length > 0
                ? "bg-signal-red-50 border border-signal-red/20"
                : "bg-amber-50 border border-amber-200"
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 ${
                critical.length > 0 ? "text-signal-red" : "text-amber-600"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {critical.length > 0
                  ? `${critical.length} critical item${critical.length > 1 ? "s" : ""} require attention`
                  : `${warnings.length} item${warnings.length > 1 ? "s" : ""} flagged for review`}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Review the findings below for details and recommended actions.
              </p>
            </div>
          </div>
        )}

        {/* Action Items */}
        {report.actionItems.length > 0 && (
          <section>
            <h4 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-spruce" />
              Action Items
            </h4>
            <div className="space-y-2">
              {report.actionItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.urgent
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-divider bg-paper"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      item.urgent ? "bg-amber-500" : "bg-spruce"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {item.description}
                    </p>
                    {item.dueDate && (
                      <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {item.dueDate}
                      </p>
                    )}
                  </div>
                  {item.urgent && (
                    <Badge variant="warning" size="sm">
                      Urgent
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Findings */}
        <section>
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">
            Key Findings ({report.keyFindings.length})
          </h4>
          <div className="space-y-2">
            {report.keyFindings.map((finding, idx) => (
              <FindingCard key={idx} finding={finding} />
            ))}
          </div>
        </section>

        {/* Extracted Data */}
        <section>
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">
            Extracted Data
          </h4>
          <div className="bg-paper border border-divider rounded-lg overflow-hidden">
            <div className="divide-y divide-divider">
              {Object.entries(report.extractedData).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-elevation1 transition-colors"
                >
                  <span className="text-sm text-[var(--text-secondary)]">
                    {key}
                  </span>
                  <span className="text-sm font-medium font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Document Info */}
        <section>
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">
            Document Info
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-paper border border-divider rounded-lg p-3">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-1">
                Document Type
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {document.type
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </div>
            <div className="bg-paper border border-divider rounded-lg p-3">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-1">
                Processing Status
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] capitalize">
                {document.processing.status}
              </p>
            </div>
            <div className="bg-paper border border-divider rounded-lg p-3">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-1">
                Uploaded
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-paper border border-divider rounded-lg p-3">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-1">
                Report Generated
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {new Date(report.generatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
