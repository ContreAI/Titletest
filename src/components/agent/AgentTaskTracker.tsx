"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
  Upload,
  Download,
  Eye,
  FileSignature,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/common";
import { Document } from "@/types";
import { BUYER_TASKS } from "@/data/buyerTasksMockData";
import { sellerTasks } from "@/data/sellerTasksMockData";
import { mockDocuments } from "@/data/mockData";
import ReportModal from "@/components/documents/ReportModal";
import { hasReport } from "@/lib/mockReportData";

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  upload: Upload,
  upload_pay: Upload,
  upload_form: Upload,
  download: Download,
  acknowledge: ThumbsUp,
  e_sign: FileSignature,
  review_approve: Eye,
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: "bg-fern/10", text: "text-fern", label: "Done" },
  action_required: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Action Required" },
  not_started: { bg: "bg-[var(--bg-elevation1)]", text: "text-[var(--text-tertiary)]", label: "Upcoming" },
  locked: { bg: "bg-[var(--bg-elevation1)]", text: "text-[var(--text-disabled)]", label: "Locked" },
  overdue: { bg: "bg-signal-red/10", text: "text-signal-red", label: "Overdue" },
  in_review: { bg: "bg-sea-glass/10", text: "text-sea-glass-400", label: "In Review" },
};

export interface AgentTaskTrackerProps {
  side: "buyer" | "seller";
}

export default function AgentTaskTracker({ side }: AgentTaskTrackerProps) {
  const tasks = side === "buyer" ? BUYER_TASKS : sellerTasks;
  const [filter, setFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleViewReport = (doc: Document) => {
    setSelectedDocument(doc);
    setIsReportModalOpen(true);
  };

  const filtered = filter === "all"
    ? tasks
    : filter === "agent"
      ? tasks.filter((t) => t.whoActs.includes("Agent"))
      : filter === "client"
        ? tasks.filter((t) => !t.whoActs.includes("Agent") && t.whoActs !== "Escrow")
        : tasks;

  // Group by phase
  const phases = Array.from(new Set(filtered.map((t) => t.phaseName)));

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {[
          { id: "all", label: "All Tasks" },
          { id: "agent", label: "My Tasks (Agent)" },
          { id: "client", label: "Client Tasks" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === opt.id
                ? "bg-royal text-white"
                : "bg-[var(--bg-elevation1)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Task list grouped by phase */}
      {phases.map((phase) => {
        const phaseTasks = filtered.filter((t) => t.phaseName === phase);
        return (
          <Card key={phase}>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              {phase}
            </h3>
            <div className="space-y-2">
              {phaseTasks.map((task) => {
                const ActionIcon = ACTION_ICONS[task.portalAction] || Clock;
                const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.not_started;
                const linkedDoc = task.linkedDocumentType
                  ? mockDocuments.find((d) => d.type === task.linkedDocumentType) ?? null
                  : null;
                const isLocked = task.status === "locked";

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg ${statusStyle.bg} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Status icon */}
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-fern flex-shrink-0" />
                      ) : task.status === "locked" ? (
                        <Lock className="w-5 h-5 text-[var(--text-disabled)] flex-shrink-0" />
                      ) : task.status === "overdue" ? (
                        <AlertTriangle className="w-5 h-5 text-signal-red flex-shrink-0" />
                      ) : (
                        <ActionIcon className={`w-5 h-5 flex-shrink-0 ${statusStyle.text}`} />
                      )}

                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {task.whoActs} &middot; Due: {task.dueExpression}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Document actions */}
                    {linkedDoc && !isLocked && (
                      <div className="flex items-center gap-1 mt-2 ml-8">
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-royal hover:bg-royal/5 rounded-md transition-colors"
                          title="View document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        {hasReport(linkedDoc.type) && (
                          <button
                            onClick={() => handleViewReport(linkedDoc)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-royal/70 hover:text-royal hover:bg-royal/5 rounded-md transition-colors"
                            title="View AI Summary"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Summary
                          </button>
                        )}
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-royal hover:bg-royal/5 rounded-md transition-colors"
                          title="Download document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        persona="agent"
      />
    </div>
  );
}
