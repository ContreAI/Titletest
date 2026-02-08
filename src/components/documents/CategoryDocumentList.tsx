"use client";

import { FileText, Download, ExternalLink, CheckCircle2, Clock, Upload, Sparkles } from "lucide-react";
import { Card, Button, StatusBadge } from "@/components/common";
import { DocumentWithAction, DocumentActionStatus } from "@/types";
import DocumentActionBadge from "./DocumentActionBadge";
import { formatDate } from "@/data/mockData";

interface CategoryDocumentListProps {
  documents: DocumentWithAction[];
  emptyMessage?: string;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
  onDocumentClick?: (doc: DocumentWithAction) => void;
  onViewReport?: (doc: DocumentWithAction) => void;
}

// Group documents by action status for display
function groupDocuments(documents: DocumentWithAction[]) {
  const groups: {
    needsAction: DocumentWithAction[];
    waitingOnOthers: DocumentWithAction[];
    complete: DocumentWithAction[];
    pending: DocumentWithAction[];
  } = {
    needsAction: [],
    waitingOnOthers: [],
    complete: [],
    pending: [],
  };

  documents.forEach((doc) => {
    switch (doc.actionStatus) {
      case "sign_required":
      case "review_required":
      case "upload_needed":
        if (doc.waitingOn === "agent") {
          groups.needsAction.push(doc);
        } else if (doc.waitingOn) {
          groups.waitingOnOthers.push(doc);
        } else {
          groups.needsAction.push(doc);
        }
        break;
      case "pending_from_title":
      case "pending_from_lender":
        groups.pending.push(doc);
        break;
      case "complete":
        groups.complete.push(doc);
        break;
    }
  });

  return groups;
}

function DocumentRow({
  doc,
  onClick,
  onViewReport,
}: {
  doc: DocumentWithAction;
  onClick?: () => void;
  onViewReport?: () => void;
}) {
  const hasFile = doc.filePath && doc.filePath !== "";
  const isProcessed = doc.processing.status === "processed";
  const hasReport = hasFile;

  return (
    <div
      className={`
        flex items-center justify-between p-3 rounded-lg border border-border
        ${hasFile ? "bg-paper hover:border-spruce/30 cursor-pointer" : "bg-mist/50"}
        transition-colors
      `}
      onClick={hasFile ? onClick : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`
            p-2 rounded-lg shrink-0
            ${hasFile ? "bg-spruce/10 text-spruce" : "bg-river-stone/10 text-river-stone"}
          `}
        >
          {hasFile ? (
            <FileText className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-storm-gray truncate">
            {doc.name}
          </div>
          {hasFile && doc.uploadedAt && (
            <div className="text-xs text-river-stone">
              {formatDate(doc.uploadedAt)}
            </div>
          )}
          {!hasFile && (
            <div className="text-xs text-river-stone">Not yet available</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <DocumentActionBadge
          status={doc.actionStatus}
          waitingOn={doc.waitingOn}
          size="sm"
        />
        {hasReport && onViewReport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewReport();
            }}
            className="text-spruce hover:bg-spruce/10"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">AI Report</span>
          </Button>
        )}
        {hasFile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Download action
            }}
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function DocumentSection({
  title,
  icon,
  documents,
  onDocumentClick,
  onViewReport,
}: {
  title: string;
  icon: React.ReactNode;
  documents: DocumentWithAction[];
  onDocumentClick?: (doc: DocumentWithAction) => void;
  onViewReport?: (doc: DocumentWithAction) => void;
}) {
  if (documents.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-storm-gray">
        {icon}
        <span>{title}</span>
        <span className="text-river-stone">({documents.length})</span>
      </div>
      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            onClick={() => onDocumentClick?.(doc)}
            onViewReport={onViewReport ? () => onViewReport(doc) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default function CategoryDocumentList({
  documents,
  emptyMessage = "No documents in this category",
  showUploadButton = true,
  onUploadClick,
  onDocumentClick,
  onViewReport,
}: CategoryDocumentListProps) {
  const groups = groupDocuments(documents);
  const hasDocuments = documents.length > 0;

  if (!hasDocuments) {
    return (
      <Card className="text-center py-8">
        <div className="text-river-stone mb-4">
          <FileText className="w-12 h-12 mx-auto opacity-50" />
        </div>
        <p className="text-river-stone mb-4">{emptyMessage}</p>
        {showUploadButton && (
          <Button
            variant="secondary"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={onUploadClick}
          >
            Upload Document
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      {showUploadButton && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={onUploadClick}
          >
            Upload
          </Button>
        </div>
      )}

      {/* Needs Your Action */}
      <DocumentSection
        title="Needs Your Action"
        icon={<Clock className="w-4 h-4 text-amber" />}
        documents={groups.needsAction}
        onDocumentClick={onDocumentClick}
        onViewReport={onViewReport}
      />

      {/* Waiting on Others */}
      <DocumentSection
        title="Waiting on Others"
        icon={<Clock className="w-4 h-4 text-river-stone" />}
        documents={groups.waitingOnOthers}
        onDocumentClick={onDocumentClick}
        onViewReport={onViewReport}
      />

      {/* Pending / Not Yet Issued */}
      <DocumentSection
        title="Pending"
        icon={<Clock className="w-4 h-4 text-river-stone" />}
        documents={groups.pending}
        onDocumentClick={onDocumentClick}
        onViewReport={onViewReport}
      />

      {/* Complete */}
      <DocumentSection
        title="Complete"
        icon={<CheckCircle2 className="w-4 h-4 text-fern" />}
        documents={groups.complete}
        onDocumentClick={onDocumentClick}
        onViewReport={onViewReport}
      />
    </div>
  );
}
